Guys, this file contains few things we should know:

1.What actually is sandbox and what will that do in our project?
In software development, a Sandbox is an isolated, simplified testing environment used to safely verify how your code behaves before you build the final, polished product.

In the context of our Travel-Mate project, the 

SandboxBooking.tsx
 component is a bare-bones UI specifically built to test one of the most complex pieces of logic we've written: The Two-Phase Commit Transaction Loop.

Here is exactly what the sandbox will do for us:

Test the /hold Endpoint (Step 1): When you click the "Hold Room" button, it sends a simulated request to the backend. It tells the backend to start a MongoDB transaction, decrement the 

RoomAvailability
, and create a PENDING booking. The sandbox gives us a visual confirmation that the backend didn't crash and returns a bookingId.
Hold State Management: In a real app, between holding the room and paying, the user fills out guest details and enters their credit card into Stripe. The Sandbox uses React Context to "remember" the bookingId while waiting, mimicking this middle step.
Test the /confirm Endpoint (Step 2): The "Simulate Payment Success" button skips the need to set up a real Stripe integration for now. Clicking it hits our new 

confirmBooking
 API, permanently locking in the transaction and turning it into CONFIRMED.
Instead of spending days building a beautiful, multi-page checkout flow with complex forms only to realize the backend logic crashes under the hood, the sandbox allows us to verify our database logic and API routes are 100% functional right now in a tightly controlled environment.




2.What is the use of tanstack/react-query?
TanStack Query (formerly known as React Query) is a powerful data-fetching and state-management library for React applications. It handles the complex logic of fetching, caching, synchronizing, and updating server state in your frontend.

Here is a breakdown of what it does and why it is essential for our Travel-Mate app:

1. Data Fetching & Caching
Instead of manually fetching data in every component using useEffect and useState, TanStack Query provides a simple hook (useQuery) that handles the entire lifecycle of a server request.

Caching: When you fetch data (like nearby hotels), TanStack Query automatically caches it. If you navigate away from the SearchPage and come back, it instantly shows the cached data without making another network request, making the app feel incredibly fast.
2. Background Synchronization
Stale-While-Revalidate: By default, when you return to a page, TanStack Query automatically refetches the data in the background to ensure it is fresh. It shows you the old (stale) data immediately while fetching the new data, providing a seamless user experience.
3. State Management
It manages the loading, error, and success states for you. You don't need to write manual loading spinners or error messages; you just check the status returned by the hook.

4. Optimistic Updates
This is crucial for a booking app. When you click "Hold Room," you want the UI to update instantly, even before the backend confirms it. TanStack Query allows you to optimistically update the UI and then roll back if the backend call fails.

5. Server State vs. Client State
In our app, we have two types of state:

Client State: Things like the current theme (light/dark) or form input values. This is managed by React's useState or Zustand.
Server State: Data that comes from our MongoDB database (Hotels, Bookings, Users). This is where TanStack Query shines.
By using TanStack Query for server state, we keep our code clean, prevent unnecessary API calls, and ensure our data is always synchronized with the database.

