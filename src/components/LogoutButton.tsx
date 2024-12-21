import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    console.log('logout');
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-20" />;
  }

  return (
    <Button 
      onClick={handleLogout}
      className="text-white hover:text-gray-300"
    >
      Logout
    </Button>
  );
} 