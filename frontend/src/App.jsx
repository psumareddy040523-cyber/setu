import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Leaf,
  Pill,
  Tractor,
  UserRound,
  Wrench,
  IndianRupee,
  Timer,
  MapPin,
  Star,
} from "lucide-react";
import {
  acceptOffer,
  rejectOffer,
  completeRequest,
  createOffer,
  createRequest,
  fetchDashboard,
  fetchProviderInbox,
  fetchProviders,
  fetchRequestOffers,
  fetchUsers,
  submitRating,
} from "./services/api";

const MODULES = [
  { key: "service", label: "Local Services", icon: Wrench, color: "bg-clay/15 text-clay" },
  { key: "medicine", label: "Prescription Medicine", icon: Pill, color: "bg-leaf/15 text-leaf" },
  { key: "farm", label: "Farm Supplies", icon: Leaf, color: "bg-millet/35 text-soil" },
];

const SERVICE_TYPES = ["electrician", "plumber", "mechanic", "tractor_rental", "pump_repair"];
const FARM_TYPES = ["fertilizers", "seeds", "pesticides", "tools"];

const STARTER_FORM = {
  user: "",
  category: "service",
  service_type: "electrician",
  product_name: "",
  quantity: "",
  description: "",
  prescription_image: "",
  location: "Chilakaluripet",
  latitude: "16.0898",
  longitude: "80.1670",
  preferred_time: "Today evening",
};

function LoginScreen_DELETED() {
  const [tab, setTab] = useState("customer"); // customer | provider | admin
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      let user;
      if (tab === "admin") {
        user = await loginAdmin(pin);
      } else {
        user = await loginUser(phone, pin);
        if (user.role !== tab) {
          setError(`This account is a ${user.role}, not a ${tab}. Please use the correct tab.`);
          setBusy(false);
          return;
        }
      }
      localStorage.setItem("seva_user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const tabs = [
    { key: "customer", label: "Customer", icon: UserRound, color: "text-leaf", active: "bg-leaf text-white" },
    { key: "provider", label: "Provider", icon: Tractor, color: "text-clay", active: "bg-clay text-white" },
    { key: "admin", label: "Admin", icon: ShieldCheck, color: "text-soil", active: "bg-soil text-white" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-amber-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Rural Smart Marketplace</p>
          <h1 className="mt-1 font-display text-4xl">SevaSetu</h1>
          <p className="mt-2 text-sm text-stone-500">Sign in to your account</p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-2xl shadow-stone-900/10 backdrop-blur">
          {/* Role tabs */}
          <div className="mb-6 flex rounded-2xl bg-stone-100 p-1.5 gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); setError(""); setPhone(""); setPin(""); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold transition ${
                  tab === t.key ? t.active : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab !== "admin" && (
              <div>
                <label className="text-sm font-semibold text-stone-700">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    className="field pl-9"
                    type="tel"
                    placeholder="e.g. 9000000001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-stone-700">
                {tab === "admin" ? "Admin PIN" : "PIN"}
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  className="field pl-9 tracking-[0.3em]"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition disabled:opacity-60 ${
                tab === "admin" ? "bg-soil hover:bg-soil/90" : tab === "provider" ? "bg-clay hover:bg-clay/90" : "bg-leaf hover:bg-leaf/90"
              }`}
            >
              {busy ? "Signing in…" : `Sign in as ${tabs.find((t) => t.key === tab)?.label}`}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-4 text-xs">
          <p className="mb-2 font-semibold text-stone-700">🔑 Demo Credentials</p>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-stone-500">
                <th className="pb-1 pr-3">Role</th>
                <th className="pb-1 pr-3">Name</th>
                <th className="pb-1 pr-3">Phone</th>
                <th className="pb-1">PIN</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CREDS.map((c) => (
                <tr key={c.phone + c.role} className="border-t border-stone-100">
                  <td className="py-0.5 pr-3 font-medium text-stone-600">{c.role}</td>
                  <td className="py-0.5 pr-3 text-stone-700">{c.name}</td>
                  <td className="py-0.5 pr-3 font-mono text-stone-700">{c.phone}</td>
                  <td className="py-0.5 font-mono font-bold text-leaf">{c.pin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [customerMode, setCustomerMode] = useState(true);
  const [form, setForm] = useState(STARTER_FORM);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [providerInbox, setProviderInbox] = useState([]);
  const [selectedInboxRequest, setSelectedInboxRequest] = useState(null);
  const [offerForm, setOfferForm] = useState({ price: "", availability: "Available", eta_minutes: 30, delivery_option: "Pickup only" });
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);


  const customerUsers = useMemo(() => users.filter((u) => u.role === "customer"), [users]);
  const providerProfiles = useMemo(() => providers, [providers]);

  const selectedCustomer = useMemo(() => {
    const id = Number(form.user);
    return customerUsers.find((u) => u.id === id);
  }, [customerUsers, form.user]);

  const selectedProvider = useMemo(() => {
    const id = Number(providerId);
    return providerProfiles.find((p) => p.id === id);
  }, [providerProfiles, providerId]);

  async function boot() {
    setLoading(true);
    try {
      const [dash, allUsers, allProviders] = await Promise.all([fetchDashboard(), fetchUsers(), fetchProviders()]);
      setDashboard(dash);
      setUsers(allUsers);
      setProviders(allProviders);

      if (allUsers.length > 0) {
        const firstCustomer = allUsers.find((u) => u.role === "customer");
        if (firstCustomer) {
          setForm((prev) => ({ ...prev, user: String(firstCustomer.id) }));
        }
      }
      if (allProviders.length > 0 && !providerId) {
        const firstId = String(allProviders[0].id);
        setProviderId(firstId);
        loadProviderInbox(firstId);
      }
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.message || "Unable to connect to backend API.";
      setToast(msg);
      setDashboard(null);
      setUsers([]);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    if (!providerId) return;
    loadProviderInbox(providerId);
  }, [providerId]);

  function showToast(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function handleCreateRequest(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        user: Number(form.user),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      const requestRecord = await createRequest(payload);
      setCreatedRequest(requestRecord);
      setOffers([]);
      showToast("Request posted. Nearby providers can now send offers.");
      await boot();
    } catch (error) {
      showToast(error?.response?.data?.non_field_errors?.[0] || "Failed to create request.");
    }
  }

  async function loadOffers(requestId = createdRequest?.id) {
    if (!requestId) return;
    try {
      const data = await fetchRequestOffers(requestId);
      setOffers(data);
    } catch {
      showToast("Unable to load offers for this request.");
    }
  }

  async function handleAcceptOffer(offerId) {
    try {
      await acceptOffer(offerId);
      showToast("Offer accepted. Request is now assigned.");
      await loadOffers();
      await boot();
    } catch {
      showToast("Offer acceptance failed.");
    }
  }

  async function handleRejectOffer(offerId) {
    try {
      await rejectOffer(offerId);
      showToast("Offer rejected.");
      await loadOffers();
    } catch {
      showToast("Offer rejection failed.");
    }
  }

  async function handleCompleteAndRate() {
    if (!createdRequest?.id) return;
    const acceptedOffer = offers.find((offer) => offer.status === "accepted");
    if (!acceptedOffer) {
      showToast("Accept an offer first.");
      return;
    }

    try {
      await completeRequest(createdRequest.id);
      await submitRating({
        request: createdRequest.id,
        user: Number(form.user),
        provider: acceptedOffer.provider,
        rating: Number(ratingForm.rating),
        review: ratingForm.review,
      });
      showToast("Request completed and provider rated.");
      await loadOffers();
      await boot();
    } catch {
      showToast("Unable to complete and rate request.");
    }
  }

  async function loadProviderInbox(providerProfileId) {
    try {
      const data = await fetchProviderInbox(providerProfileId);
      setProviderInbox(data);
    } catch {
      setProviderInbox([]);
    }
  }

  async function handleSendOffer(e) {
    e.preventDefault();
    if (!selectedInboxRequest) {
      showToast("Please click a request from the inbox above first.");
      return;
    }
    if (!providerId) {
      showToast("Please select a provider profile.");
      return;
    }
    if (!offerForm.price || Number(offerForm.price) <= 0) {
      showToast("Please enter a valid price.");
      return;
    }

    setSendingOffer(true);
    try {
      const etaMins = Number(offerForm.eta_minutes);
      await createOffer({
        request: selectedInboxRequest.id,
        provider: Number(providerId),
        price: Number(offerForm.price),
        availability: offerForm.availability,
        eta: `${etaMins} mins`,
        eta_minutes: etaMins,
        delivery_time: `${offerForm.delivery_option} ${etaMins} mins`,
        delivery_option: offerForm.delivery_option,
      });
      showToast("Offer sent! Switching to Customer view so they can see and accept it.");
      setOfferForm({ price: "", availability: "Available", eta_minutes: 30, delivery_option: "Pickup only" });
      setSelectedInboxRequest(null);
      await loadProviderInbox(providerId);
      await boot();
      setCustomerMode(true);
    } catch (error) {
      const errData = error?.response?.data;
      const msg =
        errData?.non_field_errors?.[0] ||
        errData?.detail ||
        (errData && typeof errData === "object" ? Object.values(errData).flat()[0] : null) ||
        "Could not create offer.";
      showToast(msg);
    } finally {
      setSendingOffer(false);
    }
  }

  function renderCustomerForm() {
    const module = MODULES.find((m) => m.key === form.category);
    const hasNoCustomers = customerUsers.length === 0;

    return (
      <form className="card space-y-4 animate-rise" onSubmit={handleCreateRequest}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Post a Request</h2>
          <span className={`badge ${module?.color || ""}`}>
            <module.icon className="mr-1 h-4 w-4" /> {module?.label}
          </span>
        </div>

        {hasNoCustomers && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">No customers in the system.</p>
            <p className="mt-1">Add demo data: in the backend folder run <code className="rounded bg-amber-100 px-1">python manage.py seed_demo</code></p>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold">Customer</label>
          <select
            className="field mt-1"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            required
            disabled={hasNoCustomers}
          >
            <option value="">{hasNoCustomers ? "— No customers —" : "— Select customer —"}</option>
            {customerUsers.map((user) => (
              <option value={user.id} key={user.id}>
                {user.name} - {user.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Category</label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODULES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setForm({ ...form, category: item.key })}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  form.category === item.key
                    ? "border-leaf bg-leaf text-white"
                    : "border-stone-300 bg-white hover:border-leaf/50"
                }`}
              >
                <item.icon className="mx-auto mb-1 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {form.category === "service" && (
          <div>
            <label className="text-sm font-semibold">Service Type</label>
            <select className="field mt-1" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
              {SERVICE_TYPES.map((type) => (
                <option value={type} key={type}>{type.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        )}

        {form.category === "farm" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Product Type</label>
              <select className="field mt-1" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
                {FARM_TYPES.map((type) => (
                  <option value={type} key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Quantity</label>
              <input className="field mt-1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="2 bags" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold">Product Name</label>
              <input className="field mt-1" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="Urea fertilizer" />
            </div>
          </div>
        )}

        {form.category === "medicine" && (
          <div>
            <label className="text-sm font-semibold">Prescription Image URL</label>
            <input
              className="field mt-1"
              value={form.prescription_image}
              onChange={(e) => setForm({ ...form, prescription_image: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}

        <div>
          <label className="text-sm font-semibold">Description / Problem</label>
          <textarea
            className="field mt-1 min-h-[96px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Water pump not working"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">Location</label>
            <input className="field mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Latitude</label>
            <input className="field mt-1" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold">Longitude</label>
            <input className="field mt-1" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Preferred Time</label>
          <input className="field mt-1" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} />
        </div>

        <button
          className="w-full rounded-xl bg-leaf px-4 py-3 font-semibold text-white transition hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={hasNoCustomers}
        >
          Post Request
        </button>
      </form>
    );
  }

  function renderOffers() {
    return (
      <section className="card animate-rise space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl">Offers Comparison</h2>
          <button
            className="rounded-lg border border-leaf px-3 py-1.5 text-sm font-semibold text-leaf hover:bg-leaf/10"
            onClick={() => loadOffers()}
            disabled={!createdRequest}
          >
            Refresh Offers
          </button>
        </div>

        {!createdRequest && <p className="text-sm text-stone-600">Create a request to start receiving offers.</p>}

        {createdRequest && (
          <div className="rounded-xl bg-stone-100 p-3 text-sm">
            Request #{createdRequest.id} | {createdRequest.category} | {createdRequest.location}
          </div>
        )}

        <div className="space-y-2">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{offer.provider_name}</p>
                  <p className="text-xs text-stone-500">Status: {offer.status}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge"><IndianRupee className="mr-1 h-3 w-3" />{offer.price}</span>
                  <span className="badge"><MapPin className="mr-1 h-3 w-3" />{offer.distance_km} km</span>
                  <span className="badge"><Star className="mr-1 h-3 w-3" />{offer.provider_rating}</span>
                  <span className="badge"><Timer className="mr-1 h-3 w-3" />{offer.eta || offer.eta_minutes + " mins"}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-700">{offer.availability}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAcceptOffer(offer.id)}
                  disabled={offer.status !== "pending"}
                  className="rounded-lg bg-clay px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  Accept Offer
                </button>
                <button
                  onClick={() => handleRejectOffer(offer.id)}
                  disabled={offer.status !== "pending"}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {createdRequest && offers.length === 0 && <p className="text-sm text-stone-600">No offers yet. Ask providers to check inbox.</p>}
        </div>

        <div className="rounded-xl border border-stone-200 p-4">
          <h3 className="font-semibold">Completion + Rating</h3>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold">Rating</label>
              <select
                className="field mt-1"
                value={ratingForm.rating}
                onChange={(e) => setRatingForm({ ...ratingForm, rating: e.target.value })}
              >
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Review</label>
              <input
                className="field mt-1"
                value={ratingForm.review}
                onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                placeholder="Quick review"
              />
            </div>
          </div>
          <button
            className="mt-3 rounded-lg bg-soil px-3 py-2 text-sm font-semibold text-white"
            onClick={handleCompleteAndRate}
            disabled={!createdRequest}
          >
            Complete Request and Submit Rating
          </button>
        </div>
      </section>
    );
  }

  function renderProviderPanel() {
    return (
      <section className="space-y-4">
        <div className="card animate-rise">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Provider Inbox</h2>
            <button
              type="button"
              className="rounded-lg border border-leaf px-3 py-1.5 text-sm font-semibold text-leaf hover:bg-leaf/10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => providerId && loadProviderInbox(providerId)}
              disabled={!providerId}
            >
              Refresh Inbox
            </button>
          </div>
          <p className="mt-1 text-sm text-stone-600">Respond to open requests within your service range.</p>

          <div className="mt-4">
            <label className="text-sm font-semibold">Select Provider Profile</label>
            <select className="field mt-1" value={providerId} onChange={(e) => setProviderId(e.target.value)} disabled={providerProfiles.length === 0}>
              <option value="">{providerProfiles.length === 0 ? "— No providers —" : "— Select provider —"}</option>
              {providerProfiles.map((provider) => (
                <option value={provider.id} key={provider.id}>
                  {provider?.user_name ?? "—"} - {provider?.service_type ?? "—"}
                </option>
              ))}
            </select>
            {providerProfiles.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">Add demo data: in the backend folder run <code className="rounded bg-amber-100 px-1">python manage.py seed_demo</code></p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {providerInbox.map((req) => (
              <button
                type="button"
                key={req.id}
                onClick={() => setSelectedInboxRequest(req)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedInboxRequest?.id === req.id ? "border-leaf bg-leaf/10" : "border-stone-200 bg-white hover:border-leaf/40"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">Request #{req.id} - {req.category}</span>
                  <span className="text-xs text-stone-500">{req.location}</span>
                </div>
                <p className="mt-1 text-sm text-stone-600">{req.description || req.product_name || "No description"}</p>
              </button>
            ))}
            {providerInbox.length === 0 && <p className="text-sm text-stone-600">No matching requests at the moment.</p>}
          </div>
        </div>

        <form className="card animate-rise space-y-3" onSubmit={handleSendOffer}>
          <h3 className="font-display text-lg">Send Offer</h3>
          {selectedInboxRequest ? (
            <p className="rounded-lg bg-leaf/10 px-3 py-2 text-sm font-semibold text-leaf">
              Selected: Request #{selectedInboxRequest.id} — {selectedInboxRequest.category} — {selectedInboxRequest.location}
            </p>
          ) : (
            <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700">
              ⬆ Click a request from the inbox above to select it, then fill in your offer.
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Price (INR)</label>
              <input
                className="field mt-1"
                value={offerForm.price}
                onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                required
                type="number"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">ETA Minutes</label>
              <input
                className="field mt-1"
                value={offerForm.eta_minutes}
                onChange={(e) => setOfferForm({ ...offerForm, eta_minutes: e.target.value })}
                type="number"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Availability</label>
              <select
                className="field mt-1"
                value={offerForm.availability}
                onChange={(e) => setOfferForm({ ...offerForm, availability: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Delivery Option</label>
              <select
                className="field mt-1"
                value={offerForm.delivery_option}
                onChange={(e) => setOfferForm({ ...offerForm, delivery_option: e.target.value })}
              >
                <option value="Pickup only">Pickup only</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-soil px-4 py-3 font-semibold text-white hover:bg-soil/90 transition disabled:opacity-70 disabled:cursor-wait"
            type="submit"
            disabled={sendingOffer}
          >
            {sendingOffer ? "Sending…" : "Submit Offer"}
          </button>
        </form>
      </section>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-xl shadow-stone-900/5 backdrop-blur animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">Rural Smart Marketplace</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">SevaSetu</h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-700 sm:text-base">
              Demand to Offer to Selection to Fulfillment. Connect villagers and farmers with pharmacies,
              agro stores, and local service providers in under 10 km.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-stone-100 p-2">
            <button
              onClick={() => setCustomerMode(true)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                customerMode ? "bg-leaf text-white" : "text-stone-700"
              }`}
            >
              <UserRound className="mr-1 inline h-4 w-4" /> Customer
            </button>
            <button
              onClick={() => setCustomerMode(false)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                !customerMode ? "bg-soil text-white" : "text-stone-700"
              }`}
            >
              <Tractor className="mr-1 inline h-4 w-4" /> Provider
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat title="Open Requests" value={dashboard?.open_requests ?? "-"} />
          <Stat title="Active Providers" value={dashboard?.active_providers ?? "-"} />
          <Stat title="Accepted Offers" value={dashboard?.accepted_offers ?? "-"} />
          <Stat title="Completed" value={dashboard?.completed_requests ?? "-"} />
        </div>
      </header>

      {loading && <p className="mb-4 text-sm">Loading...</p>}
      {toast && <div className="mb-4 rounded-xl bg-soil p-3 text-sm font-semibold text-white">{toast}</div>}

      {customerMode ? (
        <main className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {renderCustomerForm()}
          {renderOffers()}
        </main>
      ) : (
        <main>{renderProviderPanel()}</main>
      )}

      <footer className="mt-8 rounded-2xl border border-stone-200 bg-white/80 p-4 text-xs text-stone-600">
        <p className="font-semibold">Hackathon Demo Quick Run</p>
        <p className="mt-1">1) Customer posts request. 2) Provider responds from inbox. 3) Customer compares offers and accepts best one.</p>
        <p className="mt-1 flex items-center"><CheckCircle2 className="mr-1 h-4 w-4 text-leaf" /> Works for services, medicine and farm supply scenarios.</p>
      </footer>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-stone-500">{title}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

export default App;
