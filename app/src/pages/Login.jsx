import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser, isAuthenticated } from "../auth/auth";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/project" />;
  }

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        values,
        {
          withCredentials: true,
        }
      );

      // Save tokens & user info to localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Call your existing loginUser if it does anything else
      loginUser(response.data.user);

      toast.success("Login successful ✅");
      navigate("/project");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Sign In
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-blaack-500 outline-none transition-all"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-black-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-black-600 hover:text-indigo-500 font-medium"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
