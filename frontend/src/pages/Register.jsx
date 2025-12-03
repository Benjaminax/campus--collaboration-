import React, { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input, Card } from '../components/ui'
import ThemeSwitcher from '../components/ui/ThemeSwitcher'
import { useForm } from 'react-hook-form'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: authRegister, isAuthenticated, isLoading } = useAuth()
  
  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    const { confirmPassword, ...submitData } = data
    const result = await authRegister(submitData)
    if (!result.success) {
      setError('root', { message: result.error })
    }
  }

  const watchPassword = watch('password')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-accent-100 dark:from-secondary-900 dark:to-gray-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeSwitcher />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-16 sm:-right-32 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-16 sm:-left-32 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-30 h-30 sm:w-60 sm:h-60 bg-gradient-to-r from-accent-400 to-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6,
          ease: [0.4, 0.0, 0.2, 1],
          type: "spring",
          stiffness: 100
        }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-6 sm:p-8 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div 
              className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut",
                rotate: { duration: 1.2, ease: "easeInOut" }
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 15,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <span className="text-white font-bold text-2xl sm:text-3xl">C</span>
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Join Campus Collaboration Board
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {errors.root && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.root.message}
                </p>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              required
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                }
              })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email'
                }
              })}
            />

            <Input
              label="Department"
              type="text"
              placeholder="e.g., Computer Science"
              required
              error={errors.department?.message}
              {...register('department', {
                required: 'Department is required'
              })}
            />

            <Input
              label="Student ID"
              type="text"
              placeholder="Enter your student ID"
              error={errors.studentId?.message}
              {...register('studentId')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                required
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                style={{ position: 'relative', top: '-2.5rem', right: '0.75rem', float: 'right' }}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === watchPassword || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                style={{ position: 'relative', top: '-2.5rem', right: '0.75rem', float: 'right' }}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded focus-ring mt-1"
                  {...register('terms', {
                    required: 'You must agree to the terms and conditions'
                  })}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.terms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>

            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default Register