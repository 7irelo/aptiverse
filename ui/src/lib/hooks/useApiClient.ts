'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5196/api"

export function useApiClient() {
  const { data: session } = useSession()

  return useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    client.interceptors.request.use(
      (config) => {
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    return client
  }, [session?.accessToken])
}