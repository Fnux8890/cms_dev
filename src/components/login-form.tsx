'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './ui/form'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [emailInteracted, setEmailInteracted] = useState(false)
  const [passwordInteracted, setPasswordInteracted] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        form.setError('root', {
          message: result.error || 'Login failed',
        })
        return
      }

      window.location.replace('/')
    } catch {
      form.setError('root', {
        message: 'An error occurred during login',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {form.formState.errors.root && (
          <div className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            const showError = emailInteracted && !!form.formState.errors.email

            return (
              <FormItem>
                <FormLabel className={cn(showError && 'text-red-500')}>
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => {
                      if (e.target.value.trim() !== '') {
                        setEmailInteracted(true)
                      }
                      field.onChange(e)
                    }}
                    onBlur={(e) => {
                      field.onBlur()
                      if (!e.currentTarget.value.trim()) {
                        form.clearErrors('email')
                      }
                    }}
                    className={cn(
                      showError &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    value={field.value}
                    ref={field.ref}
                  />
                </FormControl>
                {showError && <FormMessage className="text-red-500" />}
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            const showError = passwordInteracted && !!form.formState.errors.password

            return (
              <FormItem>
                <FormLabel className={cn(showError && 'text-red-500')}>
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    onChange={(e) => {
                      if (e.target.value.trim() !== '') {
                        setPasswordInteracted(true)
                      }
                      field.onChange(e)
                    }}
                    onBlur={(e) => {
                      field.onBlur()
                      if (!e.currentTarget.value.trim()) {
                        form.clearErrors('password')
                      }
                    }}
                    className={cn(
                      showError &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                    value={field.value}
                    ref={field.ref}
                  />
                </FormControl>
                {showError && <FormMessage className="text-red-500" />}
              </FormItem>
            )
          }}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <a
              href="/auth/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </Form>
  )
} 