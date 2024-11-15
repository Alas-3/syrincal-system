'use client'

import React, { useState } from 'react'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/router'
import supabase from '@/lib/supabaseClient'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Authenticate the user using email and password
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Check for authentication error
    if (authError) {
      setError(authError.message)
      console.error('Authentication Error:', authError.message)
      return
    }

    // Log the entire response data to see its structure
    console.log('Authentication Response Data:', data)

    const user = data.user // Accessing user object from the response

    // Check if the user object contains the email
    if (!user || !user.email) {
      setError('Failed to retrieve user information. Email is missing.')
      console.error('User object or email is missing:', user)
      return
    }

    // Fetch the user's role from the public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    if (profileError) {
      console.error('Error fetching user role:', profileError)
      setError(`Failed to fetch user role: ${profileError.message}`)
      return
    }

    if (!profile) {
      setError('User profile not found')
      return
    }

    // Redirect based on the user's role
    switch (profile.role) {
      case 'admin':
        router.push('/admin-dashboard')
        break
      case 'manager':
        router.push('/manager-dashboard')
        break
      case 'agent':
        router.push('/agent-dashboard')
        break
      default:
        setError('Unknown role')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out hover:shadow-3xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Clinic Inventory</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage your inventory</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm transition duration-300 ease-in-out"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm transition duration-300 ease-in-out"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition duration-300 ease-in-out"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-teal-600 hover:text-teal-500 transition duration-300 ease-in-out">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-teal-500 group-hover:text-teal-400 transition duration-300 ease-in-out" aria-hidden="true" />
              </span>
              Sign in
              <ArrowRight className="ml-2 -mr-1 h-5 w-5 text-teal-400 group-hover:text-teal-300 transition duration-300 ease-in-out" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
