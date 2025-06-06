"use client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = getCookie("auth_token");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      router.push("/admin/customers");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="border p-2 rounded"
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="ZIP"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Customer"}
        </button>
      </form>
    </div>
  );
}
