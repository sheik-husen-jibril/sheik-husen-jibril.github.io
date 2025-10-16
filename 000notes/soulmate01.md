# SoulmateOne Project Tutorial

A comprehensive guide to the Laravel-based dating application

## Table of Contents

- [1. Models](#1-models)
- [2. Controllers](#2-controllers)
- [3. Database Structure](#3-database-structure)
- [4. Views & Templates](#4-views--templates)
- [5. Routes](#5-routes)
- [6. Other Components](#6-other-components)

---

## 1. Models

The SoulmateOne application uses several Eloquent models to represent the core entities. Each model defines the structure, relationships, and business logic for its respective data.

### User Model

The User model extends Laravel's Authenticatable class and serves as the foundation for user authentication and relationships.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function preference(): HasOne
    {
        return $this->hasOne(Preference::class);
    }

    public function sentMatches(): HasMany
    {
        return $this->hasMany(UserMatch::class);
    }

    public function receivedMatches(): HasMany
    {
        return $this->hasMany(UserMatch::class, 'matched_user_id');
    }
}
```

**Relationships:**
- HasOne: Profile
- HasOne: Preference
- HasMany: sentMatches (UserMatch)
- HasMany: receivedMatches (UserMatch)

### Profile Model

Stores detailed user profile information including personal details, bio, and interests.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'age',
        'gender',
        'bio',
        'location',
        'interests',
        'photo',
    ];

    protected $casts = [
        'interests' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### Preference Model

Defines user preferences for matching, including age range, gender preference, and location.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Preference extends Model
{
    protected $fillable = [
        'user_id',
        'min_age',
        'max_age',
        'gender_preference',
        'location_preference',
        'interests_preference',
    ];

    protected $casts = [
        'interests_preference' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### UserMatch Model

Handles the matching system between users, including status tracking and compatibility scoring.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'user_id',
        'matched_user_id',
        'status',
        'compatibility_score',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matchedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matched_user_id');
    }

    public static function findPotentialMatches(User $user): \Illuminate\Database\Eloquent\Collection
    {
        $preference = $user->preference;
        $profile = $user->profile;

        if (!$preference || !$profile) {
            return collect();
        }

        $query = User::where('id', '!=', $user->id)
            ->whereHas('profile', function ($q) use ($preference, $profile) {
                if ($preference->min_age) {
                    $q->where('age', '>=', $preference->min_age);
                }
                if ($preference->max_age) {
                    $q->where('age', '<=', $preference->max_age);
                }
                if ($preference->gender_preference !== 'any') {
                    $q->where('gender', $preference->gender_preference);
                }
            })
            ->whereDoesntHave('receivedMatches', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereDoesntHave('sentMatches', function ($q) use ($user) {
                $q->where('matched_user_id', $user->id);
            });

        return $query->with('profile')->get();
    }
}
```

**Key Method:** `findPotentialMatches()` implements the core matching algorithm based on user preferences and existing matches.

---

## 2. Controllers

The controllers handle HTTP requests and orchestrate the application's logic. SoulmateOne uses resource controllers for CRUD operations.

### SoulmateMatchController

Manages the matching system, including displaying potential matches, sending requests, and handling responses.

```php
<?php

namespace App\Http\Controllers;

use App\Models\UserMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SoulmateMatchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $user = Auth::user();
        $profile = $user->profile;
        $preference = $user->preference;

        if (!$profile || !$preference) {
            return view('soulmate.matches.index', [
                'potentialMatches' => collect(),
                'message' => 'Please complete your profile and preferences to see matches.'
            ]);
        }

        // Complex matching query with filters
        $potentialMatches = \App\Models\User::where('id', '!=', $user->id)
            ->whereHas('profile', function ($query) use ($preference) {
                $query->where('age', '>=', $preference->min_age ?? 18)
                    ->where('age', '<=', $preference->max_age ?? 100)
                    ->where('gender', $preference->gender_preference === 'any' ? '!=' : '=', $preference->gender_preference)
                    ->when($preference->location_preference, function ($q) use ($preference) {
                        $q->where('location', 'like', '%' . $preference->location_preference . '%');
                    });
            })
            ->whereHas('preference', function ($query) use ($profile) {
                $query->where(function ($q) use ($profile) {
                    $q->where('gender_preference', 'any')
                        ->orWhere('gender_preference', $profile->gender);
                })
                ->where(function ($q) use ($profile) {
                    $q->where('min_age', '<=', $profile->age)
                        ->where('max_age', '>=', $profile->age);
                });
            })
            ->whereDoesntHave('sentMatches', function ($query) use ($user) {
                $query->where('matched_user_id', $user->id);
            })
            ->whereDoesntHave('receivedMatches', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['profile', 'preference'])
            ->get();

        // Filter by interests overlap
        $potentialMatches = $potentialMatches->filter(function ($matchUser) use ($profile, $preference) {
            $userInterests = $profile->interests ?? [];
            $matchInterests = $matchUser->profile->interests ?? [];
            $overlap = array_intersect($userInterests, $matchInterests);
            return !empty($overlap);
        });

        return view('soulmate.matches.index', compact('potentialMatches'));
    }
}
```

**Matching Logic:** The index method implements a sophisticated matching algorithm that considers preferences, mutual compatibility, and prevents duplicate matches.

### SoulmateProfileController

Handles user profile management including creation, editing, and photo uploads.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SoulmateProfileController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->has('interests') && is_string($request->interests)) {
            $request->merge(['interests' => array_map('trim', explode(',', $request->interests))]);
        }

        $request->validate([
            'age' => 'required|integer|min:18|max:100',
            'gender' => 'required|in:male,female,other',
            'bio' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'interests' => 'nullable|array',
            'photo' => 'nullable|image|max:2048',
        ]);

        $profile = new Profile($request->only(['age', 'gender', 'bio', 'location', 'interests']));
        $profile->user_id = Auth::id();

        if ($request->hasFile('photo')) {
            $profile->photo = $request->file('photo')->store('profiles', 'public');
        }

        $profile->save();

        return redirect()->route('soulmate-profile.edit')->with('status', 'Profile created successfully.');
    }
}
```

### SoulmatePreferenceController

Manages user dating preferences for the matching algorithm.

```php
<?php

namespace App\Http\Controllers;

use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class SoulmatePreferenceController extends Controller
{
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request): RedirectResponse
    {
        if ($request->has('interests_preference') && is_string($request->interests_preference)) {
            $request->merge(['interests_preference' => array_map('trim', explode(',', $request->interests_preference))]);
        }

        $request->validate([
            'min_age' => 'nullable|integer|min:18|max:100',
            'max_age' => 'nullable|integer|min:18|max:100',
            'gender_preference' => 'required|in:male,female,other,any',
            'location_preference' => 'nullable|string|max:255',
            'interests_preference' => 'nullable|array',
        ]);

        $preference = Auth::user()->preference ?? new Preference(['user_id' => Auth::id()]);
        $preference->fill($request->only(['min_age', 'max_age', 'gender_preference', 'location_preference', 'interests_preference']));
        $preference->save();

        return redirect()->route('soulmate-preference.edit')->with('status', 'Preferences updated successfully.');
    }
}
```

---

## 3. Database Structure

The database schema is designed to support user profiles, preferences, and the matching system.

### Profiles Table

```sql
Schema::create('profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->integer('age');
    $table->enum('gender', ['male', 'female', 'other']);
    $table->text('bio')->nullable();
    $table->string('location')->nullable();
    $table->json('interests')->nullable();
    $table->string('photo')->nullable();
    $table->timestamps();
});
```

### Preferences Table

```sql
Schema::create('preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->integer('min_age')->nullable();
    $table->integer('max_age')->nullable();
    $table->enum('gender_preference', ['male', 'female', 'other', 'any'])->default('any');
    $table->string('location_preference')->nullable();
    $table->json('interests_preference')->nullable();
    $table->timestamps();
});
```

### Matches Table

```sql
Schema::create('matches', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('matched_user_id')->constrained('users')->onDelete('cascade');
    $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
    $table->decimal('compatibility_score', 5, 2)->nullable();
    $table->timestamps();
});
```

### Database Seeding

The application includes factories and seeders to populate the database with sample data.

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Download some profile images
        $this->downloadProfileImages();

        // Create 20 users with profiles and preferences
        User::factory(20)->create()->each(function ($user) {
            $user->profile()->create(\Database\Factories\ProfileFactory::new()->make()->toArray());
            $user->preference()->create(\Database\Factories\PreferenceFactory::new()->make()->toArray());
        });

        // Keep the test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ])->each(function ($user) {
            $user->profile()->create(\Database\Factories\ProfileFactory::new()->make()->toArray());
            $user->preference()->create(\Database\Factories\PreferenceFactory::new()->make()->toArray());
        });
    }

    private function downloadProfileImages()
    {
        for ($i = 1; $i <= 20; $i++) {
            $url = "https://picsum.photos/400/400?random={$i}";
            $contents = file_get_contents($url);
            Storage::disk('public')->put("profiles/{$i}.jpg", $contents);
        }
    }
}
```

---

## 4. Views & Templates

The application uses Blade templates for rendering views, with Tailwind CSS for styling.

### Navigation Layout

The main navigation bar with responsive design and user dropdown.

```blade
<nav x-data="{ open: false }" class="bg-gradient-to-r from-gray-800 via-gray-900 to-black border-b border-gray-700/50 shadow-2xl backdrop-blur-sm z-10 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('dashboard') }}" class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <span class="text-xl font-bold text-white">Soulmate</span>
                    </a>
                </div>
                <div class="hidden space-x-1 sm:-my-px sm:ms-10 sm:flex sm:mt-1">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')" class="text-cyan-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-blue-600/30 px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/30 font-medium">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                        </svg>
                        {{ __('Dashboard') }}
                    </x-nav-link>
                    <x-nav-link :href="route('soulmate-profile.edit')" :active="request()->routeIs('soulmate-profile.*')" class="text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/30 font-medium">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        {{ __('My Profile') }}
                    </x-nav-link>
                    <x-nav-link :href="route('soulmate-preference.edit')" :active="request()->routeIs('soulmate-preference.*')" class="text-indigo-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/30 hover:to-purple-600/30 px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-500/30 font-medium">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {{ __('Preferences') }}
                    </x-nav-link>
                    <x-nav-link :href="route('soulmate-matches.index')" :active="request()->routeIs('soulmate-matches.*')" class="text-green-300 hover:text-white hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20 px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        {{ __('Matches') }}
                    </x-nav-link>
                </div>
            </div>
            <!-- User dropdown and responsive menu -->
        </div>
    </div>
</nav>
```

### Matches Index View

Displays potential matches, accepted matches, and pending requests in a card-based layout.

```blade
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    @foreach ($potentialMatches as $user)
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div class="p-4">
                <div class="flex items-center mb-3">
                    @if ($user->profile->photo && \Storage::disk('public')->exists($user->profile->photo))
                        <img src="{{ asset('storage/' . $user->profile->photo) }}" alt="Profile" class="w-12 h-12 rounded-full mr-3 object-cover">
                    @else
                        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3">
                            <span class="text-white font-bold text-sm">{{ strtoupper(substr($user->name, 0, 1)) }}</span>
                        </div>
                    @endif
                    <div>
                        <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ $user->name }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $user->profile->age }} • {{ ucfirst($user->profile->gender) }}</p>
                    </div>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{{ $user->profile->bio ?: 'No bio yet.' }}</p>
                @if ($user->profile->interests && is_array($user->profile->interests))
                    <div class="flex flex-wrap gap-1 mb-4">
                        @foreach (array_slice($user->profile->interests, 0, 3) as $interest)
                            <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">{{ $interest }}</span>
                        @endforeach
                    </div>
                @endif
                <form method="POST" action="{{ route('soulmate-matches.store') }}" class="inline">
                    @csrf
                    <input type="hidden" name="matched_user_id" value="{{ $user->id }}">
                    <button type="submit" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                        Send Match Request
                    </button>
                </form>
            </div>
        </div>
    @endforeach
</div>
```

---

## 5. Routes

The application defines routes for profile management, preferences, and matching functionality.

| Method | URI | Name | Controller@Method | Description |
|--------|-----|------|-------------------|-------------|
| GET | /soulmate-profile | soulmate-profile.show | SoulmateProfileController@myProfile | Display current user's profile |
| GET | /soulmate-profile/edit | soulmate-profile.edit | SoulmateProfileController@edit | Show profile edit form |
| PUT | /soulmate-profile | soulmate-profile.update | SoulmateProfileController@update | Update user profile |
| GET | /soulmate-preference/edit | soulmate-preference.edit | SoulmatePreferenceController@edit | Show preferences edit form |
| PUT | /soulmate-preference | soulmate-preference.update | SoulmatePreferenceController@update | Update user preferences |
| GET | /soulmate-matches | soulmate-matches.index | SoulmateMatchController@index | Display potential matches |
| POST | /soulmate-matches | soulmate-matches.store | SoulmateMatchController@store | Send match request |
| PUT | /soulmate-matches/{match} | soulmate-matches.update | SoulmateMatchController@update | Accept/reject match request |

```php
Route::middleware('auth')->group(function () {
    // Soulmate routes
    Route::get('soulmate-profile', [SoulmateProfileController::class, 'myProfile'])->name('soulmate-profile.show');
    Route::get('soulmate-profile/edit', [SoulmateProfileController::class, 'edit'])->name('soulmate-profile.edit');
    Route::put('soulmate-profile', [SoulmateProfileController::class, 'update'])->name('soulmate-profile.update');
    Route::get('soulmate-profile/create', [SoulmateProfileController::class, 'create'])->name('soulmate-profile.create');
    Route::post('soulmate-profile', [SoulmateProfileController::class, 'store'])->name('soulmate-profile.store');
    Route::delete('soulmate-profile', [SoulmateProfileController::class, 'destroy'])->name('soulmate-profile.destroy');

    Route::get('soulmate-preference/edit', [SoulmatePreferenceController::class, 'edit'])->name('soulmate-preference.edit');
    Route::put('soulmate-preference', [SoulmatePreferenceController::class, 'update'])->name('soulmate-preference.update');
    Route::get('soulmate-preference/create', [SoulmatePreferenceController::class, 'create'])->name('soulmate-preference.create');
    Route::post('soulmate-preference', [SoulmatePreferenceController::class, 'store'])->name('soulmate-preference.store');
    Route::delete('soulmate-preference', [SoulmatePreferenceController::class, 'destroy'])->name('soulmate-preference.destroy');

    Route::resource('soulmate-matches', SoulmateMatchController::class)->parameters(['soulmate-matches' => 'match']);
});
```

---

## 6. Other Components

### Factories

Laravel factories generate fake data for testing and seeding.

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'age' => fake()->numberBetween(18, 60),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'bio' => fake()->paragraph(),
            'location' => fake()->city() . ', ' . fake()->country(),
            'interests' => array_unique(array_merge(
                ['reading', 'sports', 'music'],
                fake()->randomElements([
                    'travel', 'cooking', 'art', 'movies', 'gaming',
                    'fitness', 'photography', 'dancing', 'hiking',
                    'writing', 'painting', 'yoga'
                ], fake()->numberBetween(0, 3))
            )),
            'photo' => 'profiles/' . fake()->numberBetween(1, 20) . '.jpg',
        ];
    }
}
```

### Console Commands

Custom Artisan commands for maintenance tasks.

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DownloadProfileImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:download';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download profile images from Lorem Picsum';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        for ($i = 1; $i <= 20; $i++) {
            $url = "https://picsum.photos/400/400?random={$i}";
            $contents = file_get_contents($url);
            Storage::disk('public')->put("profiles/{$i}.jpg", $contents);
            $this->info("Downloaded image {$i}");
        }
    }
}
```

### Key Features

- **Smart Matching Algorithm:** Considers age, gender, location, and interests
- **Mutual Compatibility:** Both users must match each other's preferences
- **Photo Upload:** Profile pictures stored in public storage
- **Interest Matching:** Overlapping interests improve match quality
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- **Real-time Updates:** AJAX-powered interactions (potential)
- **Security:** Authentication, authorization, and input validation
- **Scalable Architecture:** Clean separation of concerns with MVC pattern

---

*Copyright 2025 SoulmateOne Tutorial. Built with love using Laravel and Tailwind CSS.*