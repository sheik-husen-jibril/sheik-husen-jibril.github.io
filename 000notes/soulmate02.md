# Soulmate Dating Website Tutorial

## Overview

This is a comprehensive Laravel-based dating website called "Soulmate" that allows users to create profiles, set preferences, find matches, and chat with potential partners. The application uses modern web technologies including Laravel 11, Tailwind CSS, and JavaScript for a responsive and interactive user experience.

## Project Structure

### Core Technologies
- **Laravel 11**: PHP framework for backend logic
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Blade Templates**: Laravel's templating engine
- **SQLite**: Database for development
- **JavaScript**: For interactive features like AJAX chat and dynamic UI

### Directory Structure
```
soulmateone/
├── app/
│   ├── Http/Controllers/          # Controllers for handling requests
│   ├── Models/                    # Eloquent models
│   └── Providers/                 # Service providers
├── database/
│   ├── migrations/                # Database schema definitions
│   └── seeders/                   # Database seeders
├── public/                        # Public assets (CSS, JS, images)
├── resources/
│   ├── css/                       # Stylesheets
│   ├── js/                        # JavaScript files
│   └── views/                     # Blade templates
├── routes/
│   └── web.php                    # Route definitions
└── config/                        # Configuration files
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    age INTEGER NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    bio TEXT NULL,
    country VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    interests JSON NULL,
    photo VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Preferences Table
```sql
CREATE TABLE preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    min_age INTEGER NULL,
    max_age INTEGER NULL,
    gender_preference ENUM('male', 'female', 'other', 'any') DEFAULT 'any',
    country_preference VARCHAR(255) NULL,
    city_preference VARCHAR(255) NULL,
    interests_preference JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Matches Table
```sql
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    matched_user_id INTEGER NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    compatibility_score DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Models

### User Model (`app/Models/User.php`)
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

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }
}
```

The User model extends Laravel's Authenticatable class and includes relationships to Profile, Preference, UserMatch, and Message models. It handles user authentication and provides access to related data.

### Profile Model (`app/Models/Profile.php`)
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
        'country',
        'city',
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

The Profile model stores user profile information including age, gender, bio, location, interests (stored as JSON), and profile photo path.

### Preference Model (`app/Models/Preference.php`)
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
        'country_preference',
        'city_preference',
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

The Preference model stores user dating preferences including age range, gender preference, location preferences, and preferred interests.

### UserMatch Model (`app/Models/UserMatch.php`)
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
                // Add more filters as needed
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

The UserMatch model handles the matching system with a static method `findPotentialMatches` that finds compatible users based on preferences.

### Message Model (`app/Models/Message.php`)
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['sender_id', 'receiver_id', 'message', 'read_at'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
```

The Message model handles chat messages between matched users.

## Controllers

### SoulmateProfileController (`app/Http/Controllers/SoulmateProfileController.php`)

This controller manages user profiles with CRUD operations:

**Key Methods:**
- `edit()`: Shows the profile edit form with countries list
- `update()`: Updates profile with validation and photo upload
- `myProfile()`: Displays current user's profile
- `store()`: Creates new profile
- `destroy()`: Deletes profile

**Validation Rules:**
```php
$request->validate([
    'age' => 'required|integer|min:18|max:100',
    'gender' => 'required|in:male,female,other',
    'bio' => 'nullable|string|max:500',
    'country' => 'nullable|string|max:255',
    'city' => 'nullable|string|max:255',
    'interests' => 'nullable|array',
    'photo' => 'nullable|image|max:2048',
]);
```

### SoulmatePreferenceController (`app/Http/Controllers/SoulmatePreferenceController.php`)

Manages user dating preferences:

**Key Methods:**
- `edit()`: Shows preference edit form
- `update()`: Updates preferences with validation

**Validation Rules:**
```php
$request->validate([
    'min_age' => 'nullable|integer|min:18|max:100',
    'max_age' => 'nullable|integer|min:18|max:100',
    'gender_preference' => 'required|in:male,female,other,any',
    'country_preference' => 'nullable|string|max:255',
    'city_preference' => 'nullable|string|max:255',
    'interests_preference' => 'nullable|array',
]);
```

### SoulmateMatchController (`app/Http/Controllers/SoulmateMatchController.php`)

Handles the matching system and match management:

**Key Methods:**
- `index()`: Shows matches page with potential, accepted, sent, and received matches
- `store()`: Sends match request via AJAX
- `update()`: Accepts or rejects match requests

**Matching Logic:**
The `index()` method implements complex matching logic that:
1. Filters users by age range and gender preferences
2. Ensures mutual compatibility (user's preferences match potential match's profile)
3. Excludes already matched users
4. Counts unread messages for accepted matches

### ChatController (`app/Http/Controllers/ChatController.php`)

Manages real-time chat functionality:

**Key Methods:**
- `show()`: Displays chat interface for matched users
- `store()`: Sends messages via AJAX
- `getMessages()`: Retrieves messages for AJAX polling

**Security Check:**
```php
$isMatched = $user->sentMatches()->where('matched_user_id', $userId)->where('status', 'accepted')->exists() ||
    $user->receivedMatches()->where('user_id', $userId)->where('status', 'accepted')->exists();

if (!$isMatched) {
    abort(403, 'You can only chat with your matches.');
}
```

### LocationController (`app/Http/Controllers/LocationController.php`)

Provides AJAX endpoint for dynamic city loading:

**Key Method:**
- `getCities()`: Returns cities for selected country using PragmaRX Countries package

## Routes (`routes/web.php`)

```php
// Authentication routes (provided by Laravel Breeze)
require __DIR__ . '/auth.php';

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Authenticated routes
Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('soulmate-profile', [SoulmateProfileController::class, 'myProfile'])->name('soulmate-profile.show');
    Route::get('soulmate-profile/edit', [SoulmateProfileController::class, 'edit'])->name('soulmate-profile.edit');
    Route::put('soulmate-profile', [SoulmateProfileController::class, 'update'])->name('soulmate-profile.update');
    Route::get('soulmate-profile/create', [SoulmateProfileController::class, 'create'])->name('soulmate-profile.create');
    Route::post('soulmate-profile', [SoulmateProfileController::class, 'store'])->name('soulmate-profile.store');
    Route::delete('soulmate-profile', [SoulmateProfileController::class, 'destroy'])->name('soulmate-profile.destroy');

    // Preference routes
    Route::get('soulmate-preference/edit', [SoulmatePreferenceController::class, 'edit'])->name('soulmate-preference.edit');
    Route::put('soulmate-preference', [SoulmatePreferenceController::class, 'update'])->name('soulmate-preference.update');

    // Match routes
    Route::resource('soulmate-matches', SoulmateMatchController::class)->parameters(['soulmate-matches' => 'match']);
});

// API routes (outside auth for AJAX)
Route::get('cities/{country}', [LocationController::class, 'getCities'])->name('api.cities');

// Chat routes
Route::middleware('auth')->group(function () {
    Route::get('chat/{user}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/{user}', [ChatController::class, 'store'])->name('chat.store');
    Route::get('chat/{user}/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
});
```

## Views

### Layout Structure

The application uses Laravel's Blade templating with a consistent layout structure:

**App Layout (`resources/views/layouts/app.blade.php`):**
- Navigation bar
- Main content area
- Footer
- Dark theme with gradient accents

**Key Components:**
- `x-app-layout`: Main application layout
- `x-guest-layout`: Guest layout for login/register
- Form components: `x-text-input`, `x-primary-button`, etc.

### Profile Views

**Edit Profile (`resources/views/soulmate/profile/edit.blade.php`):**
- Form with fields for age, gender, bio, country, city, interests, photo
- Dynamic city loading via AJAX
- Photo upload with preview
- Interest tags input

**Show Profile (`resources/views/soulmate/profile/show.blade.php`):**
- Display user's own profile
- Shows preferences alongside profile info
- Edit buttons for profile and preferences

### Preference Views

**Edit Preferences (`resources/views/soulmate/preference/edit.blade.php`):**
- Age range sliders (min/max)
- Gender preference dropdown
- Location preferences
- Interest preferences

### Matches View (`resources/views/soulmate/matches/index.blade.php`)

**Features:**
- Tabbed interface: Matches, Sent Requests, Received Requests
- Potential matches grid with "Send Match Request" buttons
- Accepted matches with chat links and unread message indicators
- AJAX-powered match request sending
- Dynamic tab switching with JavaScript

**JavaScript Functionality:**
```javascript
// Send match request
sendMatchButtons.forEach(button => {
    button.addEventListener('click', function() {
        const userId = this.getAttribute('data-user-id');
        fetch('/soulmate-matches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ matched_user_id: userId })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI
                this.closest('.bg-gray-700').remove();
                addToSentRequests(userId, userName, userAge, userGender, userBio, userPhoto, userInterests);
            }
        });
    });
});
```

### Chat View (`resources/views/soulmate/chat/show.blade.php`)

**Features:**
- Real-time chat interface
- Message bubbles with timestamps
- Profile photos in chat
- AJAX message sending
- Polling for new messages every 5 seconds
- Emoji button for fun interactions

**JavaScript Chat Logic:**
```javascript
// Send message
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (message) {
        fetch(`/chat/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: JSON.stringify({ message: message })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                input.value = '';
                loadMessages();
            }
        });
    }
});

// Poll for new messages
setInterval(loadMessages, 5000);
```

## Key Features

### 1. User Authentication
- Laravel Breeze for authentication
- Email verification
- Password reset functionality

### 2. Profile Management
- Comprehensive profile creation/editing
- Photo upload with storage
- Interest tagging system
- Location selection with country/city dropdowns

### 3. Preference Setting
- Age range preferences
- Gender preferences
- Location preferences
- Interest matching

### 4. Matching System
- Algorithm-based potential matches
- Mutual preference compatibility
- Match request system (pending/accepted/rejected)
- Compatibility scoring (future enhancement)

### 5. Real-time Chat
- AJAX-powered messaging
- Message read status
- Unread message indicators
- Polling-based real-time updates

### 6. Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Dark theme with gradient accents
- Interactive UI elements

## Security Features

### Authentication & Authorization
- All sensitive routes protected by `auth` middleware
- CSRF protection on forms
- User ownership validation on profile/preference updates

### Data Validation
- Comprehensive server-side validation
- File upload restrictions (images only, 2MB max)
- Input sanitization

### Chat Security
- Match verification before allowing chat access
- User ID validation in URLs
- XSS protection via Blade templating

## Database Relationships

```
User (1) ──── (1) Profile
   │
   ├── (1) Preference
   │
   ├── (many) sentMatches ──── (1) UserMatch
   │       │
   │       └── (1) matchedUser
   │
   └── (many) sentMessages ──── (1) Message
           │
           └── (1) receiver
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soulmateone
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Build assets**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

## Future Enhancements

1. **Real-time messaging** with WebSockets (Laravel Echo + Pusher/Socket.io)
2. **Advanced matching algorithm** with compatibility scoring
3. **Geolocation features** for proximity matching
4. **Video chat integration**
5. **Premium features** (boosts, super likes)
6. **Admin panel** for user management
7. **Push notifications**
8. **Mobile app** with React Native

## Conclusion

The Soulmate dating website is a comprehensive Laravel application that demonstrates modern web development practices including:

- MVC architecture with Eloquent ORM
- RESTful routing and resource controllers
- AJAX-powered interactive features
- Responsive design with utility-first CSS
- Secure authentication and authorization
- Real-time communication features
- Scalable database design

The application successfully combines user-friendly interfaces with robust backend logic to create an engaging dating platform that prioritizes user safety, privacy, and positive matching experiences.