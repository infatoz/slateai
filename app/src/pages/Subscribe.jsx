import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Dialog } from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";

export default function Subscribe() {
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const storedAuthUser = localStorage.getItem("authUser");
    if (storedAuthUser) {
      try {
        const user = JSON.parse(storedAuthUser);
        setProfileName(user.fullName || "");
        setProfilePic(user.profileImage || "");
      } catch (err) {
        console.error("Failed to parse authUser from localStorage", err);
      }
    }
  }, []);

  const openModal = (plan) => {
    setSelectedPlan(plan);
    setIsOpen(true);
  };

  const handleSubscribe = () => {
    setIsOpen(false);
    toast.success(`Subscribed to ${selectedPlan} plan successfully!`);
  };

  return (
    <div className="flex h-screen w-screen bg-white">
      <Sidebar profileName={profileName} />
      <div className="flex flex-col flex-1">
        <Topbar profileName={profileName} profilePic={profilePic} />
        <main className="flex-1 overflow-auto bg-white px-4 py-8">
          <section className="max-w-screen-xl mx-auto py-8 lg:py-16 px-4 lg:px-6">
            <div className="text-center max-w-screen-md mx-auto mb-12">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
                Designed for business teams like yours
              </h2>
              <p className="text-gray-500 font-light sm:text-xl">
                Here at SlateAi we focus on markets where technology,
                innovation, and capital can unlock long-term value and drive
                economic growth.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 xl:gap-10">
              <PricingCard
                title="Starter"
                price="$29"
                features={[
                  "Individual configuration",
                  "No setup, or hidden fees",
                  "Team size: 1 developer",
                  "Premium support: 6 months",
                  "Free updates: 6 months",
                ]}
                onClick={() => openModal("Starter")}
              />
              <PricingCard
                title="Company"
                price="$99"
                features={[
                  "Individual configuration",
                  "No setup, or hidden fees",
                  "Team size: 10 developers",
                  "Premium support: 24 months",
                  "Free updates: 24 months",
                ]}
                onClick={() => openModal("Company")}
              />
              <PricingCard
                title="Enterprise"
                price="$199"
                features={[
                  "Custom configuration",
                  "No setup, or hidden fees",
                  "Team size: Unlimited",
                  "Premium support: Lifetime",
                  "Free updates: Lifetime",
                ]}
                onClick={() => openModal("Enterprise")}
              />
            </div>
          </section>
        </main>
      </div>

      {/* Toast container */}
      <Toaster position="top-center" />

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Subscribe to {selectedPlan}
            </Dialog.Title>
            <p className="mb-4 text-sm text-gray-600">
              Confirm your subscription to the <strong>{selectedPlan}</strong>{" "}
              plan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
              >
                Subscribe
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

const PricingCard = ({ title, price, features, onClick }) => (
  <div className="flex flex-col p-6 bg-white rounded-lg border border-gray-100 shadow text-center max-w-lg mx-auto">
    <h3 className="text-2xl font-semibold mb-4">{title}</h3>
    <p className="font-light text-gray-500 sm:text-lg">
      {title === "Starter"
        ? "Best option for personal use & for your next project."
        : title === "Company"
        ? "Relevant for multiple users, extended & premium support."
        : "Best for large scale uses and extended distribution."}
    </p>
    <div className="flex justify-center items-baseline my-8">
      <span className="text-5xl font-extrabold mr-2">{price}</span>
      <span className="text-gray-500">/month</span>
    </div>
    <ul role="list" className="text-left space-y-4 mb-8">
      {features.map((item, i) => (
        <li key={i} className="flex items-center space-x-3">
          <CheckIcon />
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className="text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5"
    >
      Get started
    </button>
  </div>
);

const CheckIcon = () => (
  <svg
    className="flex-shrink-0 w-5 h-5 text-green-500"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);
