import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">Welcome to the Clinic System</h1>
        <p className="mb-4">Please <Link href="/login" className="text-blue-600">Login</Link> to access the system.</p>
      </div>
    </div>
  );
}
