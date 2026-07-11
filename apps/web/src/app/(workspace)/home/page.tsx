import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-5xl font-bold mb-4">Welcome to Sous</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Your AI-powered restaurant operating system.
      </p>
      <div className="space-x-4">
        <Link href="/recipes" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md text-lg font-medium">
            Go to Recipes
        </Link>
        <Link href="/inventory" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-md text-lg font-medium">
            Go to Inventory
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
