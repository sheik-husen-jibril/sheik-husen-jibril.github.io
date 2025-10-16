# Soulmate One - Views Tutorial

This tutorial provides a comprehensive guide to all the views (pages) in the Soulmate One application. Each section describes a specific view, its purpose, key features, and how to interact with it.

## 1. Welcome Page (`resources/views/welcome.blade.php`)

The welcome page is the landing page that visitors see when they first visit the site.

### Purpose
- Introduces the Soulmate One application
- Provides navigation to login or registration
- Showcases the main value proposition

### Key Features
- Gradient background with dark theme
- Prominent "Find Your Soulmate" heading
- Call-to-action buttons for "Get Started" and "Log in"
- Heart icon visual element

### Navigation
- Accessible at the root URL (`/`)
- Header navigation shows login/register links for guests, dashboard link for authenticated users

### Code Example
```html
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Soulmate One') }}</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />
    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body {
                font-family: 'Inter', sans-serif;
            }
        </style>
    @endif
</head>
<body class="dark bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white min-h-screen flex flex-col">
    @if (Route::has('login'))
        <header class="absolute top-0 right-0 px-2 py-2 z-10">
            <nav class="flex items-center gap-4">
                @auth
                    <a href="{{ url('/dashboard') }}"
                        class="inline-flex items-center gap-2 px-5 py-2 text-white border border-gray-400 hover:border-gray-300 rounded-lg text-sm leading-normal transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Dashboard
                    </a>
                @else
                    <a href="{{ route('login') }}"
                        class="inline-block px-5 py-2 text-gray-300 hover:text-white border border-transparent hover:border-gray-400 rounded-lg text-sm leading-normal transition-colors">
                        Log in
                    </a>
                    @if (Route::has('register'))
                        <a href="{{ route('register') }}"
                            class="inline-block px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg text-sm leading-normal transition-all shadow-lg hover:shadow-xl">
                            Get Started
                        </a>
                    @endif
                @endauth
            </nav>
        </header>
    @endif
    <div class="flex items-center justify-center w-full flex-1 px-6 lg:px-8">
        <main class="flex max-w-[335px] w-full flex-col items-center text-center lg:max-w-4xl lg:flex-row lg:items-start lg:text-left">
            <!-- Text Content -->
            <div class="flex-1 mb-8 lg:mb-0 lg:mr-12">
                <h1 class="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Find Your Soulmate
                </h1>
                <p class="text-lg lg:text-xl text-gray-300 mb-6 leading-relaxed">
                    Find your perfect match today. Join our community of singles looking for love.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    @if (Route::has('register'))
                        <a href="{{ route('register') }}"
                            class="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full text-lg leading-normal transition-all shadow-lg hover:shadow-xl">
                            Get Started
                        </a>
                    @endif
                </div>
            </div>
            <!-- Visual Element -->
            <div class="relative">
                <div class="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full flex items-center justify-center shadow-2xl">
                    <svg class="w-32 h-32 lg:w-40 lg:h-40" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="#ff6b9d" stroke-width="1" />
                        <path fill="#ff6b9d" d="M12 8 C12 6, 16 6, 16 8 C16 10, 12 12, 12 14 C12 12, 8 10, 8 8 C8 6, 12 6, 12 8 Z" />
                    </svg>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
```

## 2. Login Page (`resources/views/auth/login.blade.php`)

The login page allows existing users to authenticate into the application.

### Purpose
- User authentication
- Secure access to the application

### Key Features
- Email and password input fields
- "Remember me" checkbox
- Links to forgot password and registration
- Session status messages
- Gradient background matching the theme

### Navigation
- Route: `login`
- Accessible from welcome page header or registration page

## 3. Registration Page (`resources/views/auth/register.blade.php`)

The registration page allows new users to create accounts.

### Purpose
- User registration
- Account creation

### Key Features
- Name, email, password, and confirm password fields
- Links to login page
- Validation error handling
- Gradient background

### Navigation
- Route: `register`
- Accessible from welcome page or login page

## 4. Forgot Password Page (`resources/views/auth/forgot-password.blade.php`)

Allows users to request password reset emails.

### Purpose
- Password recovery
- Security feature for account access

### Key Features
- Email input field
- Session status display
- Uses guest layout

### Navigation
- Route: `password.request`
- Accessible from login page

## 5. Reset Password Page (`resources/views/auth/reset-password.blade.php`)

Allows users to set a new password using a reset token.

### Purpose
- Password reset completion
- Secure password update

### Key Features
- Email, password, and confirm password fields
- Hidden token field
- Uses guest layout

### Navigation
- Route: `password.reset`
- Accessed via email link

## 6. Verify Email Page (`resources/views/auth/verify-email.blade.php`)

Handles email verification for new accounts.

### Purpose
- Email verification
- Account security

### Key Features
- Instructions for email verification
- Resend verification email button
- Logout option
- Uses guest layout

### Navigation
- Route: `verification.notice`
- Automatic redirect after registration

## 7. Confirm Password Page (`resources/views/auth/confirm-password.blade.php`)

Requires password confirmation for sensitive operations.

### Purpose
- Additional security layer
- Protects sensitive actions

### Key Features
- Password input field
- Uses guest layout

### Navigation
- Route: `password.confirm`
- Triggered by certain protected actions

## 8. Dashboard (`resources/views/dashboard.blade.php`)

The main dashboard after user login.

### Purpose
- Central hub for application features
- Quick access to main functionalities

### Key Features
- Three main cards: My Profile, My Preferences, My Matches
- Gradient card designs with hover effects
- Uses app layout

### Navigation
- Route: `dashboard`
- Default redirect after login

### Code Example
```html
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-100 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12 mx-2 md:mx-0 ">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-gray-800/50 backdrop-blur-sm overflow-hidden shadow-2xl rounded-md sm:rounded-lg border border-gray-700/50">
                <div class="p-6 text-gray-100">
                    <div class="text-center mb-8">
                        <h3 class="text-3xl font-bold text-white mb-2">Welcome to Soulmate Finder!</h3>
                        <p class="text-gray-300 text-lg">Find your perfect match for marriage</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Profile Card -->
                        <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-2xl transform hover:scale-105 transition duration-300">
                            <div class="flex items-center mb-4">
                                <svg class="w-10 h-10 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                                </svg>
                                <h4 class="text-2xl font-bold">My Profile</h4>
                            </div>
                            <p class="mb-6 text-purple-100">Set up your dating profile to attract potential matches.</p>
                            <a href="{{ route('soulmate-profile.edit') }}" class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300 inline-flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Edit Profile
                            </a>
                        </div>

                        <!-- Preferences Card -->
                        <div class="bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl p-6 text-white shadow-2xl transform hover:scale-105 transition duration-300">
                            <div class="flex items-center mb-4">
                                <svg class="w-10 h-10 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h4 class="text-2xl font-bold">My Preferences</h4>
                            </div>
                            <p class="mb-6 text-blue-100">Tell us what you're looking for in a partner.</p>
                            <a href="{{ route('soulmate-preference.edit') }}" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300 inline-flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Set Preferences
                            </a>
                        </div>

                        <!-- Matches Card -->
                        <div class="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-2xl transform hover:scale-105 transition duration-300">
                            <div class="flex items-center mb-4">
                                <svg class="w-10 h-10 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                                </svg>
                                <h4 class="text-2xl font-bold">My Matches</h4>
                            </div>
                            <p class="mb-6 text-green-100">View your potential matches and connections.</p>
                            <a href="{{ route('soulmate-matches.index') }}" class="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300 inline-flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                                View Matches
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
```

## 9. Soulmate Profile Edit (`resources/views/soulmate/profile/edit.blade.php`)

Allows users to create and edit their dating profile.

### Purpose
- Profile creation and management
- Personal information input

### Key Features
- Age, gender, bio, country, city, interests fields
- Profile photo upload
- Country and city dropdowns (with AJAX for cities)
- Form validation

### Navigation
- Route: `soulmate-profile.edit`
- Accessible from dashboard or profile show page

### Code Example
```html
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-100 leading-tight">
            {{ __('Edit Profile') }}
        </h2>
    </x-slot>

    <div class="py-12 mx-2 md:mx-0">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-gray-800 overflow-hidden shadow-xl rounded-md sm:rounded-lg border border-gray-700">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                    <h3 class="text-2xl font-bold text-white">Create Your Soulmate Profile</h3>
                    <p class="text-green-100 mt-2">Tell us about yourself to find your perfect match</p>
                </div>

                <div class="p-6 text-gray-100">
                    <form method="POST" action="{{ route('soulmate-profile.update') }}" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
                            <!-- Age -->
                            <div>
                                <x-input-label for="age" :value="__('Age')" class="text-gray-200 font-semibold" />
                                <x-text-input id="age"
                                    class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                    type="number" name="age" :value="old('age', $profile->age)" required autofocus
                                    autocomplete="age" />
                                <x-input-error :messages="$errors->get('age')" class="mt-2" />
                            </div>

                            <!-- Gender -->
                            <div>
                                <x-input-label for="gender" :value="__('Gender')" class="text-gray-200 font-semibold" />
                                <select id="gender" name="gender"
                                    class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                    required>
                                    <option value="male"
                                        {{ old('gender', $profile->gender) == 'male' ? 'selected' : '' }}>Male</option>
                                    <option value="female"
                                        {{ old('gender', $profile->gender) == 'female' ? 'selected' : '' }}>Female
                                    </option>
                                    <option value="other"
                                        {{ old('gender', $profile->gender) == 'other' ? 'selected' : '' }}>Other
                                    </option>
                                </select>
                                <x-input-error :messages="$errors->get('gender')" class="mt-2" />
                            </div>
                        </div>

                        <!-- Bio -->
                        <div class="mt-6">
                            <x-input-label for="bio" :value="__('About Me')" class="text-gray-200 font-semibold" />
                            <textarea id="bio" name="bio"
                                class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                rows="4" placeholder="Tell us about yourself...">{{ old('bio', $profile->bio) }}</textarea>
                            <x-input-error :messages="$errors->get('bio')" class="mt-2" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 px-2 md:px-0">
                            <!-- Country -->
                            <div>
                                <x-input-label for="country" :value="__('Country')" class="text-gray-200 font-semibold" />
                                <select id="country"
                                    class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                    name="country">
                                    <option value="">Select Country</option>
                                    @foreach ($countries as $country)
                                        <option value="{{ $country->cca3 }}"
                                            {{ old('country', $profile->country) == $country->cca3 ? 'selected' : '' }}>
                                            {{ $country->name->common }}
                                        </option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('country')" class="mt-2" />
                            </div>

                            <!-- City -->
                            <div>
                                <x-input-label for="city" :value="__('City')" class="text-gray-200 font-semibold" />
                                <select id="city"
                                    class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                    name="city">
                                    <option value="">Select City</option>
                                    @if (old('city', $profile->city))
                                        <option value="{{ old('city', $profile->city) }}" selected>
                                            {{ old('city', $profile->city) }}</option>
                                    @endif
                                </select>
                                <x-input-error :messages="$errors->get('city')" class="mt-2" />
                            </div>

                            <!-- Interests -->
                            <div>
                                <x-input-label for="interests" :value="__('Interests')" class="text-gray-200 font-semibold" />
                                <x-text-input id="interests"
                                    class="block mt-1 w-full bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400 rounded-lg shadow-sm"
                                    type="text" name="interests" :value="old(
                                        'interests',
                                        is_array($profile->interests) ? implode(', ', $profile->interests) : '',
                                    )"
                                    placeholder="reading, sports, music, travel..." />
                                <x-input-error :messages="$errors->get('interests')" class="mt-2" />
                            </div>
                        </div>

                        <!-- Photo -->
                        <div class="mt-6">
                            <x-input-label for="photo" :value="__('Profile Photo')" class="text-gray-200 font-semibold" />
                            @if ($profile->photo && (\Storage::disk('public')->exists($profile->photo) || file_exists(public_path($profile->photo))))
                                <div class="mt-2 mb-4">
                                    <p class="text-sm text-gray-300 mb-2">Current Photo:</p>
                                    <img src="{{ \Storage::disk('public')->exists($profile->photo) ? asset('storage/' . $profile->photo) : asset($profile->photo) }}"
                                        alt="Current Profile Photo"
                                        class="w-24 h-24 rounded-full object-cover border-2 border-gray-600">
                                </div>
                            @endif
                            <div class="mt-1 flex items-center">
                                <input id="photo"
                                    class="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500"
                                    type="file" name="photo" accept="image/*" />
                            </div>
                            <p class="mt-1 text-sm text-gray-300">Upload a new photo to update your profile</p>
                            <x-input-error :messages="$errors->get('photo')" class="mt-2" />
                        </div>

                        <div class="flex items-center justify-end mt-8 pt-6 border-t border-gray-700">
                            <x-primary-button
                                class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
                                {{ __('Save Profile') }}
                            </x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
```

## 10. Soulmate Profile Show (`resources/views/soulmate/profile/show.blade.php`)

Displays the user's current profile information.

### Purpose
- Profile viewing
- Quick access to edit functions

### Key Features
- Profile photo display
- Basic information (age, gender, location)
- Bio and interests display
- Preferences summary
- Edit buttons

### Navigation
- Route: `soulmate-profile.show`
- Accessible from various places (may need to check routes)

## 11. Preferences Edit (`resources/views/soulmate/preference/edit.blade.php`)

Allows users to set their matching preferences.

### Purpose
- Preference configuration
- Matching criteria setup

### Key Features
- Age range selection
- Gender preference
- Country and city preferences
- Interests preferences
- Form validation

### Navigation
- Route: `soulmate-preference.edit`
- Accessible from dashboard or profile pages

## 12. Matches Index (`resources/views/soulmate/matches/index.blade.php`)

The main matching interface with tabs for different match states.

### Purpose
- Match discovery and management
- Communication initiation

### Key Features
- Three tabs: Matches, Sent Requests, Received Requests
- Potential matches grid with send request buttons
- Accepted matches with chat links
- AJAX-powered request sending
- Dynamic tab content

### Navigation
- Route: `soulmate-matches.index`
- Accessible from dashboard

## 13. Chat Show (`resources/views/soulmate/chat/show.blade.php`)

Real-time chat interface for matched users.

### Purpose
- Communication between matches
- Message exchange

### Key Features
- Message history display
- Real-time message sending (with AJAX)
- Emoji button for message enhancement
- Auto-scroll and polling for new messages
- User avatars and timestamps

### Navigation
- Route: `chat.show`
- Accessible from matches page for accepted matches

## 14. General Profile Edit (`resources/views/profile/edit.blade.php`)

General user profile management (separate from soulmate profile).

### Purpose
- Account information management
- Password and profile updates

### Key Features
- Three sections: Profile Info, Password Update, Delete Account
- Includes partial views for each section
- Uses app layout

### Navigation
- Route: `profile.edit`
- Typically accessible from navigation menu

## 15. Update Profile Information Form (`resources/views/profile/partials/update-profile-information-form.blade.php`)

Partial view for updating basic profile information.

### Purpose
- Name and email updates
- Email verification handling

### Key Features
- Name and email fields
- Email verification status and resend option
- Form validation

### Navigation
- Included in profile edit page

## 16. Update Password Form (`resources/views/profile/partials/update-password-form.blade.php`)

Partial view for password changes.

### Purpose
- Password security
- Account protection

### Key Features
- Current password, new password, confirm password fields
- Success message display
- Form validation

### Navigation
- Included in profile edit page

## 17. Delete User Form (`resources/views/profile/partials/delete-user-form.blade.php`)

Partial view for account deletion.

### Purpose
- Account removal
- Data privacy compliance

### Key Features
- Confirmation modal
- Password verification
- Danger button styling
- Warning messages

### Navigation
- Included in profile edit page

## Layout Components

The application uses several layout components:

- `layouts/app.blade.php`: Main application layout with navigation
- `layouts/guest.blade.php`: Guest layout for auth pages
- `layouts/navigation.blade.php`: Navigation bar component

## Component Library

Common components used across views:

- `components/application-logo.blade.php`
- `components/auth-session-status.blade.php`
- `components/dropdown.blade.php`
- `components/input-error.blade.php`
- `components/input-label.blade.php`
- `components/modal.blade.php`
- `components/nav-link.blade.php`
- `components/primary-button.blade.php`
- `components/secondary-button.blade.php`
- `components/text-input.blade.php`

## Key Technologies Used

- Laravel Blade templating
- Tailwind CSS for styling
- Alpine.js for interactivity
- AJAX for dynamic content
- File uploads for profile photos

## Navigation Flow

1. **Guest Flow**: Welcome → Register/Login → Dashboard
2. **Profile Setup**: Dashboard → Edit Profile → Edit Preferences
3. **Matching Flow**: Dashboard → View Matches → Send Requests → Chat (if accepted)
4. **Account Management**: Profile Edit → Update Info/Password/Delete

This covers all the main views in the Soulmate One application. Each view serves a specific purpose in the user journey from registration to finding matches and communicating.