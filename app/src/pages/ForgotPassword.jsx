import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
    terms: Yup.boolean().oneOf(
      [true],
      "You must accept the Terms and Conditions"
    ),
  });

  const handleSubmit = (values) => {
    alert(`Password reset link sent to ${values.email}`);
    navigate("/login");
  };

  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900"
        >
        
          SlateAI
        </a>
        <div className="w-full bg-white rounded-lg shadow sm:max-w-md p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-bold text-gray-900 text-center">
            Change Password
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values }) => (
              <Form className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Your email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder="name@company.com"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Field
                      type="checkbox"
                      name="terms"
                      id="terms"
                      className="w-4 h-4 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="terms" className="text-gray-600">
                      I accept the{" "}
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                    <ErrorMessage
                      name="terms"
                      component="div"
                      className="text-sm text-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 transition"
                >
                  Reset Password
                </button>

                <p className="text-sm text-center text-gray-600">
                  Remember your password?{" "}
                  <a
                    href="/login"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    Login
                  </a>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
}
