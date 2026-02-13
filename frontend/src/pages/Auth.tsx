import React, { useState, useEffect } from "react";
import { Flag, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Loader2, Shield, Users, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { api, authHelper } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/utils/storage";
import { useUser } from "@/contexts/UserContext";
import type { User } from "@/contexts/UserContext";
import "@/styles/auth.css";

// Separate Login Form Component
const LoginForm: React.FC<{
  onSuccess: () => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  onSwitchToSignup: () => void;
}> = ({ onSuccess, formErrors, setFormErrors, onSwitchToSignup }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();

  const validateLoginForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (!loginEmail.trim()) errors.loginEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errors.loginEmail = "Invalid email format";
    if (!loginPassword.trim()) errors.loginPassword = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchAndStoreProfile = async (): Promise<User | null> => {
    try {
      const resp = await api.getProfile();
      const raw: any = resp?.data?.[0] ?? resp?.data ?? null;

      if (raw) {
        const mapped: User = {
          id: String(raw.id || raw.user_id || raw.uuid || ""),
          first_name: raw.first_name || "",
          last_name: raw.last_name || "",
          email: raw.email || "",
          phone: raw.phone || undefined,
          is_admin: raw.is_admin || raw.isAdmin || false,
          profile_picture: raw.profile_picture || undefined,
          created_at:
            raw.created_at || raw.createdAt || new Date().toISOString(),
          updated_at:
            raw.updated_at || raw.updatedAt || new Date().toISOString(),
          name: `${raw.first_name || ""} ${raw.last_name || ""}`,
          role: raw.is_admin || raw.isAdmin ? "admin" : "user",
        };
        storage.setCurrentUser(mapped);
        setUser(mapped);
        return mapped;
      }
    } catch {

    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoginLoading(true);
    try {
      const response = await api.login(loginEmail, loginPassword);
      if (response.status >= 400) {
        toast({
          title: "Error",
          description: response.error || "Login failed",
          variant: "destructive",
        });
        return;
      }

      const token = response?.data?.[0]?.token;
      if (token) {
        authHelper.setToken(token);
        const user = await fetchAndStoreProfile();
        if (user) {
          toast({
            title: `Hello ${user.first_name}!`,
            description: "Welcome back to iReporter",
            duration: 3000,
          });
          setTimeout(() => {
            if (user.is_admin) navigate("/admin");
            else navigate("/dashboard");
          }, 2500);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative z-10">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in to your account</h3>
        <p className="text-gray-600 text-sm">Enter your credentials to access your account</p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <Label htmlFor="login-email" className="block text-xs font-medium text-gray-700 mb-1.5">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={`auth-input block w-full pl-10 pr-3 py-2 text-sm ${
                formErrors.loginEmail ? 'border-red-300' : ''
              }`}
              placeholder="Enter your email address"
            />
            {formErrors.loginEmail && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
          </div>
          {formErrors.loginEmail && (
            <p className="mt-0.5 text-xs text-red-600">{formErrors.loginEmail}</p>
          )}
        </div>

        <div>
          <Label htmlFor="login-password" className="block text-xs font-medium text-gray-700 mb-1.5">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="login-password"
              name="password"
              type={showLoginPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                formErrors.loginPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
            {formErrors.loginPassword && <AlertCircle className="absolute right-12 top-3.5 h-5 w-5 text-red-500" />}
          </div>
          {formErrors.loginPassword && (
            <p className="mt-0.5 text-xs text-red-600">{formErrors.loginPassword}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700">
              Remember me
            </Label>
          </div>

          <div className="text-xs">
            <button type="button" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={loginLoading}
            className={`auth-button group relative w-full flex justify-center py-2 px-4 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${loginLoading ? 'auth-loading' : ''}`}
          >
            {loginLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </form>

      {/* Switch to Signup Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

// Separate Signup Form Component
const SignupForm: React.FC<{
  onSuccess: () => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  onSwitchToLogin: () => void;
}> = ({ onSuccess, formErrors, setFormErrors, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(signupPassword));
  }, [signupPassword]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const validateSignupForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!signupEmail.trim()) errors.signupEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(signupEmail)) errors.signupEmail = "Invalid email format";
    if (!signupPassword.trim()) errors.signupPassword = "Password is required";
    else if (signupPassword.length < 6) errors.signupPassword = "Password must be at least 6 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchAndStoreProfile = async (): Promise<User | null> => {
    try {
      const resp = await api.getProfile();
      const raw: any = resp?.data?.[0] ?? resp?.data ?? null;

      if (raw) {
        const mapped: User = {
          id: String(raw.id || raw.user_id || raw.uuid || ""),
          first_name: raw.first_name || "",
          last_name: raw.last_name || "",
          email: raw.email || "",
          phone: raw.phone || undefined,
          is_admin: raw.is_admin || raw.isAdmin || false,
          profile_picture: raw.profile_picture || undefined,
          created_at:
            raw.created_at || raw.createdAt || new Date().toISOString(),
          updated_at:
            raw.updated_at || raw.updatedAt || new Date().toISOString(),
          name: `${raw.first_name || ""} ${raw.last_name || ""}`,
          role: raw.is_admin || raw.isAdmin ? "admin" : "user",
        };
        storage.setCurrentUser(mapped);
        setUser(mapped);
        return mapped;
      }
    } catch {

    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setSignupLoading(true);
    try {
      const response = await api.register({
        first_name: firstName,
        last_name: lastName,
        email: signupEmail,
        password: signupPassword,
      } as any);

      if (response.status >= 400) {
        toast({
          title: "Error",
          description: response.error || "Registration failed",
          variant: "destructive",
        });
        return;
      }

      const token = response?.data?.[0]?.token;
      if (token) {
        authHelper.setToken(token);
        const user = await fetchAndStoreProfile();
        if (user) {
          toast({
            title: `Hello ${user.first_name}!`,
            description: "Welcome to iReporter! Your account has been created successfully.",
            duration: 3000,
          });
          setTimeout(() => {
            if (user.is_admin) navigate("/admin");
            else navigate("/dashboard");
          }, 2500);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Registration failed",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="relative z-10 animate-fade-in signup-form-container" style={{ animationDelay: '0.8s' }}>
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-green-500/30 animate-bounce-gentle">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4 animate-pulse-slow">
          Join the Movement!
        </h3>
        <p className="text-gray-600 text-base leading-relaxed max-w-xs mx-auto">
          Create your account and start making a difference by reporting corruption anonymously
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSignup}>
        {/* Name Fields in a Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-field-group">
            <Label htmlFor="firstname" className="form-label">
              First Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="firstname"
                name="firstname"
                type="text"
                autoComplete="given-name"
                required
                aria-label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`auth-input-enhanced block w-full pl-10 pr-3 py-3 text-sm rounded-xl ${
                  formErrors.firstName ? 'border-red-300 focus:ring-red-500' : ''
                }`}
                placeholder="Enter first name"
              />
              {formErrors.firstName && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
            </div>
            {formErrors.firstName && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.firstName}
              </p>
            )}
          </div>

          <div className="form-field-group">
            <Label htmlFor="lastname" className="form-label">
              Last Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="lastname"
                name="lastname"
                type="text"
                autoComplete="family-name"
                required
                aria-label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`auth-input-enhanced block w-full pl-10 pr-3 py-3 text-sm rounded-xl ${
                  formErrors.lastName ? 'border-red-300 focus:ring-red-500' : ''
                }`}
                placeholder="Enter last name"
              />
              {formErrors.lastName && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
            </div>
            {formErrors.lastName && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {formErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="form-field-group">
          <Label htmlFor="signup-email" className="form-label">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className={`auth-input-enhanced block w-full pl-10 pr-3 py-3 text-sm rounded-xl ${
                formErrors.signupEmail ? 'border-red-300 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your email address"
            />
            {formErrors.signupEmail && <AlertCircle className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
          </div>
          {formErrors.signupEmail && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.signupEmail}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="form-field-group">
          <Label htmlFor="signup-password" className="form-label">
            Create Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="signup-password"
              name="password"
              type={showSignupPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className={`auth-input-enhanced block w-full pl-10 pr-12 py-3 text-sm rounded-xl ${
                formErrors.signupPassword ? 'border-red-300 focus:ring-red-500' : ''
              }`}
              placeholder="Create a strong password"
            />
            {signupPassword && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                {showSignupPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            )}
            {formErrors.signupPassword && <AlertCircle className="absolute right-12 top-3.5 h-5 w-5 text-red-500" />}
          </div>

          {/* Enhanced Password Strength Indicator */}
          {signupPassword && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Password Strength</span>
                <span className={`text-sm font-semibold ${
                  passwordStrength <= 2 ? 'text-red-600' :
                  passwordStrength <= 3 ? 'text-yellow-600' :
                  passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength <= 2 ? 'Weak' :
                   passwordStrength <= 3 ? 'Fair' :
                   passwordStrength <= 4 ? 'Good' : 'Excellent'}
                </span>
              </div>
              <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength
                        ? passwordStrength <= 2 ? 'bg-red-500' :
                          passwordStrength <= 3 ? 'bg-yellow-500' :
                          passwordStrength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-600">
                Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
              </div>
            </div>
          )}
          {formErrors.signupPassword && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.signupPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={signupLoading}
            className={`auth-button-signup-enhanced group relative w-full flex justify-center py-4 px-6 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
              signupLoading ? 'auth-loading' : ''
            }`}
          >
            {signupLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6" />
                Creating Your Account...
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                <span>Join iReporter Now</span>
                <TrendingUp className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <button className="text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors">
            Terms
          </button>{' '}
          and{' '}
          <button className="text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors">
            Privacy Policy
          </button>
        </p>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default function Auth() {
  const [showLogin, setShowLogin] = useState(true);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      const q = params.get("mode");
      const fromState = (location.state as any)?.mode;
      if (q === "login" || fromState === "login") {
        setShowLogin(true);
      }
    } catch (e) {

    }
  }, [location.search, (location as any).state]);



  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden auth-background">

      <div className="max-w-md w-full space-y-8 relative z-10" style={{ maxWidth: '480px' }}>
        {/* Enhanced Header with animations */}
        <div className="text-center animate-slide-down" style={{ animationDelay: '0.2s' }}>
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30 transform hover:scale-110 transition-all duration-500 hover:rotate-3">
            <Flag className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-700 bg-clip-text text-transparent mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {showLogin ? 'Sign in to iReporter' : 'Create your iReporter account'}
          </h2>
          <p className="text-gray-600 text-base font-medium leading-relaxed max-w-sm mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {showLogin ? 'Enter your credentials to access your account' : 'Join the movement and start making a difference'}
          </p>
        </div>

        {/* Clean Auth Card Container */}
        <div className="auth-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {showLogin ? (
            <LoginForm
              onSuccess={() => {}}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              onSwitchToSignup={() => setShowLogin(false)}
            />
          ) : (
            <SignupForm
              onSuccess={() => {}}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="text-center relative z-10">
          <p className="text-sm text-gray-600 leading-relaxed">
            By signing in, you agree to our{' '}
            <button className="font-semibold text-blue-600 hover:text-indigo-700 transition-colors duration-200 hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="font-semibold text-blue-600 hover:text-indigo-700 transition-colors duration-200 hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
