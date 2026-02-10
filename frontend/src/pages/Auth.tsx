import React, { useState, useEffect } from "react";
import { Flag, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { api, authHelper } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/utils/storage";
import { useUser } from "@/contexts/UserContext";
import type { User } from "@/contexts/UserContext";

export default function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Enhanced features states
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { setUser } = useUser();

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

  // Update password strength when signup password changes
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

  const validateForm = (isLogin: boolean): boolean => {
    const errors: {[key: string]: string} = {};
    if (isLogin) {
      if (!loginEmail.trim()) errors.loginEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(loginEmail)) errors.loginEmail = "Invalid email format";
      if (!loginPassword.trim()) errors.loginPassword = "Password is required";
    } else {
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
      if (!signupEmail.trim()) errors.signupEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(signupEmail)) errors.signupEmail = "Invalid email format";
      if (!signupPassword.trim()) errors.signupPassword = "Password is required";
      else if (signupPassword.length < 6) errors.signupPassword = "Password must be at least 6 characters";
    }
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

    if (!validateForm(false)) {
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
            duration: 3000, // Show for 3 seconds
          });
          // Add delay before navigation
          setTimeout(() => {
            if (user.is_admin) navigate("/admin");
            else navigate("/dashboard");
          }, 2500); // Navigate after 2.5 seconds
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
            duration: 3000, // Show for 3 seconds
          });
          // Add delay before navigation
          setTimeout(() => {
            if (user.is_admin) navigate("/admin");
            else navigate("/dashboard");
          }, 2500); // Navigate after 2.5 seconds
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-6" style={{ maxWidth: '380px' }}>
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
            <Flag className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            Welcome to iReporter
          </h2>
          <p className="text-gray-600 text-xs">
            Report corruption and interventions anonymously
          </p>
        </div>

        {/* Auth Container */}
        <div className="bg-white py-6 px-5 shadow-lg rounded-lg border border-gray-200">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 px-4 text-xs font-medium rounded-md transition-all duration-200 ${
                showLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 px-4 text-xs font-medium rounded-md transition-all duration-200 ${
                !showLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {showLogin ? (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign in to your account</h3>
                <p className="text-gray-600 text-xs">Enter your credentials to access your account</p>
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
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm ${
                        formErrors.loginEmail ? 'border-red-300' : 'border-gray-300'
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
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          ) : (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Create your account</h3>
                <p className="text-gray-600 text-xs">Join iReporter to start making a difference</p>
              </div>

              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="firstname" className="block text-xs font-medium text-gray-700 mb-1.5">
                      First Name
                    </Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      type="text"
                      autoComplete="given-name"
                      required
                      aria-label="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="First name"
                    />
                    {formErrors.firstName && <p className="mt-0.5 text-xs text-red-600">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastname" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Last Name
                    </Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      type="text"
                      autoComplete="family-name"
                      required
                      aria-label="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="Last name"
                    />
                    {formErrors.lastName && <p className="mt-0.5 text-xs text-red-600">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                    <Label htmlFor="signup-email" className="block text-xs font-medium text-gray-700 mb-1.5">
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
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                    <Label htmlFor="signup-password" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Password
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
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="Create a password"
                    />
                    {signupPassword && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={signupLoading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <button className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
