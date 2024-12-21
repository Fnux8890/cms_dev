'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched', // Validate on first blur
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        form.setError('root', {
          message: result.error || 'Registration failed',
        })
        return
      }

      window.location.replace('/auth/login')
    } catch {
      form.setError('root', {
        message: 'An error occurred during registration',
      })
    }
  }

  const getInputState = (fieldName: keyof RegisterFormData) => {
    const isFieldTouched = form.formState.touchedFields[fieldName]
    const isFieldValid = !form.formState.errors[fieldName]
    const fieldValue = form.watch(fieldName)

    if (!isFieldTouched || fieldValue === '') return ''
    return isFieldValid ? 'border-green-500' : 'border-red-500'
  }

  const getFormItemState = (fieldName: keyof RegisterFormData) => {
    const isFieldTouched = form.formState.touchedFields[fieldName]
    const isFieldValid = !form.formState.errors[fieldName]
    const fieldValue = form.watch(fieldName)

    if (!isFieldTouched || fieldValue === '') return ''
    return isFieldValid ? 'text-green-500' : 'text-destructive'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm">{form.formState.errors.root.message}</div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className={cn(getFormItemState('name'))}>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name"
                  className={cn(getInputState('name'))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className={cn(getFormItemState('email'))}>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter your email"
                  className={cn(getInputState('email'))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className={cn(getFormItemState('password'))}>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className={cn(getInputState('password'))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-gray-500 space-y-1 mt-2">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside">
                  <li className={cn(
                    "transition-colors",
                    field.value?.length >= 8 ? "text-green-500" : ""
                  )}>At least 8 characters</li>
                  <li className={cn(
                    "transition-colors",
                    /[A-Z]/.test(field.value || '') ? "text-green-500" : ""
                  )}>One uppercase letter</li>
                  <li className={cn(
                    "transition-colors",
                    /[0-9]/.test(field.value || '') ? "text-green-500" : ""
                  )}>One number</li>
                  <li className={cn(
                    "transition-colors",
                    /[^A-Za-z0-9]/.test(field.value || '') ? "text-green-500" : ""
                  )}>One special character</li>
                </ul>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className={cn(getFormItemState('confirmPassword'))}>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className={cn(getInputState('confirmPassword'))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting || !form.formState.isValid}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
        </Button>

        <div className="text-center text-sm">
          <p>
            Already have an account?{' '}
            <a href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </Form>
  )
} 