'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'fair';
  if (strength <= 5) return 'good';
  return 'strong';
}

function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-orange-500';
    case 'good':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}

function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const passwordRequirements = useMemo(() => {
    return {
      length: password.length >= 6,
      recommendedLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      setSuccess(false);
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleGoogleSignup = () => {
    // Placeholder for Google OAuth - can be implemented later
    console.log('Google signup clicked');
  };

  return (
    <div className="flex h-[700px] w-full">
      <div className="w-full hidden md:inline-block">
        <img 
          className="h-full w-full object-cover" 
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png" 
          alt="Signup illustration"
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center bg-white overflow-y-auto py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm max-w-md w-full md:w-96">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm max-w-md w-full md:w-96">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="md:w-96 w-80 flex flex-col items-center justify-center">
          <h2 className="text-4xl text-gray-900 font-medium">Create Account</h2>
          <p className="text-sm text-gray-500/90 mt-3">Join us! Create your account to get started</p>

          <button 
            type="button" 
            onClick={handleGoogleSignup}
            className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full hover:bg-gray-500/20 transition-colors"
          >
            <img 
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" 
              alt="Google logo"
              className="h-5 w-5"
            />
          </button>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-300/90"></div>
            <p className="w-full text-nowrap text-sm text-gray-500/90">or sign up with email</p>
            <div className="w-full h-px bg-gray-300/90"></div>
          </div>

          {/* Username Field */}
          <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6B7280"/>
            </svg>
            <input 
              {...register('username')}
              type="text" 
              placeholder="Username" 
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
              required
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600 w-full text-left md:w-96">
              {errors.username.message}
            </p>
          )}

          {/* Email Field */}
          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
            </svg>
            <input 
              {...register('email')}
              type="email" 
              placeholder="Email id" 
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
              required
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 w-full text-left md:w-96">
              {errors.email.message}
            </p>
          )}

          {/* Password Field */}
          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
            <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
            </svg>
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                  <path d="M2.71 1.29L1.29 2.71l16 16 1.42-1.42-16-16z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 w-full text-left md:w-96">
              {errors.password.message}
            </p>
          )}

          {/* Password Strength Indicator */}
          {password && (
            <div className="w-full mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength === 'weak' ? 'text-red-500' :
                  passwordStrength === 'fair' ? 'text-orange-500' :
                  passwordStrength === 'good' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                  style={{ 
                    width: passwordStrength === 'weak' ? '25%' :
                           passwordStrength === 'fair' ? '50%' :
                           passwordStrength === 'good' ? '75%' : '100%'
                  }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          {password && (
            <div className="w-full mt-3 space-y-1.5 text-xs">
              <p className="text-gray-500 mb-1">Password recommendations:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-red-500'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.length ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>At least 6 characters (required)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.recommendedLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.recommendedLength ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>8+ characters (recommended)</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.lowercase ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.uppercase ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.number ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>Number</span>
                </div>
                <div className={`flex items-center gap-2 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {passwordRequirements.special ? (
                      <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm3.5 5.25L6.5 9.25 3.5 6.25l1.06-1.06L6.5 7.13l2.94-2.94L10.5 5.25z" fill="currentColor"/>
                    ) : (
                      <circle cx="7" cy="7" r="6.5" stroke="currentColor" fill="none"/>
                    )}
                  </svg>
                  <span>Special character</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
            <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
            </svg>
            <input 
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm Password" 
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" 
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="pr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                  <path d="M2.71 1.29L1.29 2.71l16 16 1.42-1.42-16-16z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 w-full text-left md:w-96">
              {errors.confirmPassword.message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isLoading || success}
            className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : success ? 'Account Created!' : 'Sign Up'}
          </button>
          
          <p className="text-gray-500/90 text-sm mt-4">
            Already have an account?{' '}
            <Link className="text-indigo-400 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
