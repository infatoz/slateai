import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .min(6, "Current password must be at least 6 characters")
      .required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "New password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Please confirm your new password"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/update-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }),
        }
      );
      

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          currentPassword: data.message || "Failed to update password",
        });
      } else {
        alert(data.message || "Password updated successfully");
        navigate("/profile"); // or wherever you want
      }
    } catch (error) {
      setErrors({ currentPassword: "Server error. Please try again later." });
    }
    setSubmitting(false);
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-center text-xl font-bold mb-6">Update Password</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <Field
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded"
                />
                <ErrorMessage
                  name="currentPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <Field
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded"
                />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition ease-in-out duration-300"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
