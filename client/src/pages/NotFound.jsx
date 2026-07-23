import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <main className="error-screen">
      <h1>Page not found.</h1>
      <p>The collection you are looking for may have moved.</p>
      <Button as={Link} to="/">Back Home</Button>
    </main>
  );
}
