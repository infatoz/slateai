import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser } from "../auth/auth";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAuthenticated } from "../auth/auth";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/slateai" />;
  }

  const initialValues = {
    fullName: "",
    email: "",
    phoneNo: "", // rename from phone to phoneNo
    password: "",
  };
  

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log("Register data sent:", values);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        values
      );
      toast.success("Registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
      setSubmitting(false);
    }
  };
  
  

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-4">
              <div>
                <Field
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border rounded"
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  name="phoneNo"
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border rounded"
                />

                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                Register
              </button>

              <p className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline">
                  Login
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
