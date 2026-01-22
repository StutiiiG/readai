import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileText, MessageSquare, Quote, Zap, ArrowRight, Upload, BookOpen, Search } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Fraunces, serif' }}>
              ReadAI
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" data-testid="login-nav-btn">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button data-testid="signup-nav-btn">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section pt-24 pb-20 px-6">
        <div className="hero-bg-pattern" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-6">
                AI Research Assistant
              </span>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground mb-6 leading-tight">
                The Ultimate
                <br />
                <span className="font-normal">Research Assistant</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Tired of jumping between your research tools just to get answers? 
                ReadAI combines your documents & AI to create the optimal research workflow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2" data-testid="hero-cta-btn">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" data-testid="hero-signin-btn">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>PDF, DOCX, TXT & Images</span>
                </div>
              </div>
            </div>
            
            <div className="animate-slide-up stagger-2 hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                <div className="relative bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        You
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-muted text-sm">
                        What are the key findings in this research paper?
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-background border border-border text-sm">
                        <p className="mb-2">Based on the uploaded document, the key findings include:</p>
                        <p>1. Novel approach to neural network optimization <span className="citation-marker">[1]</span></p>
                        <p>2. 23% improvement in training efficiency <span className="citation-marker">[2]</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-4">
              Read fast, understand accurately
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find relevant sources, cite accurately, and stay focused in one tool.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Upload,
                title: "Upload Documents",
                description: "Support for PDF, DOCX, TXT files and images. Just drag and drop."
              },
              {
                icon: MessageSquare,
                title: "Ask Questions",
                description: "Natural language queries about your documents with instant responses."
              },
              {
                icon: Quote,
                title: "Cited Responses",
                description: "Every answer includes citations you can trace back to the source."
              },
              {
                icon: Zap,
                title: "Powered by Claude",
                description: "State-of-the-art AI for accurate, nuanced understanding."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-foreground mb-4">
              How ReadAI Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your research workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your Documents",
                description: "Upload PDFs, Word documents, text files, or images containing research content."
              },
              {
                step: "02",
                icon: Search,
                title: "Ask Your Questions",
                description: "Type natural language questions about your documents. ReadAI understands context."
              },
              {
                step: "03",
                icon: FileText,
                title: "Get Cited Answers",
                description: "Receive accurate responses with inline citations pointing to exact sources."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <span className="text-8xl font-light text-muted/50 absolute -top-4 -left-2">
                  {item.step}
                </span>
                <div className="relative pt-12 pl-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-4">
            Ready to transform your research?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join researchers and students who are already saving hours on document analysis.
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              data-testid="cta-signup-btn"
            >
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-medium">ReadAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ReadAI by Stuti Gaonkar. Built by a researcher, for researchers.
          </p>
        </div>
      </footer>
    </div>
  );
}
