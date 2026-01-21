import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            data-testid="back-home-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="auth-card animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-foreground">Create an account</h1>
                <p className="text-sm text-muted-foreground">Start your research journey</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="signup-name-input"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="signup-email-input"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="signup-password-input"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={loading}
                data-testid="signup-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary font-medium hover:underline"
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-medium text-foreground mb-4">
            Join Thousands of Researchers
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Graduate students, PhD candidates, and industry researchers trust DeepTutor 
            to accelerate their document analysis workflow.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-medium text-foreground">10k+</div>
              <div>Researchers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-foreground">50k+</div>
              <div>Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-foreground">99%</div>
              <div>Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
