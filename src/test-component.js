import React, { useEffect } from 'react'

/** Test component */
export function TestComponent() {
    useEffect(() => {
        console.log('Test component mounted')
    }, [])

    return (
        <div>
            <h1>Test Component</h1>
        </div>
    )
}