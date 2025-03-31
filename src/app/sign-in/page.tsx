'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <SignIn
            path="/sign-in"        // A virtual path, doesn't have to be a real route
            routing="path"      // Tells Clerk to open this in a modal
            signUpUrl="/sign-up"   // Also virtual if you want the sign-up to appear in a modal
            appearance={{
                elements: {
                    // Optional: customize styling of the modal here
                }
            }}
        />
    );
}