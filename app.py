import gradio as gr
import requests
import json

API_URL = "https://your-backend-url.onrender.com/api"


def login_customer(phone, pin):
    try:
        response = requests.post(
            f"{API_URL}/auth/login/", data={"phone": phone, "pin": pin}
        )
        if response.ok:
            return f"Login successful!\n\nWelcome, {phone}"
        return f"Login failed: {response.json().get('error', 'Unknown error')}"
    except Exception as e:
        return f"Connection error: {str(e)}\n\nPlease ensure the backend server is running."


def login_provider(phone, pin):
    return login_customer(phone, pin)


def get_dashboard():
    try:
        response = requests.get(f"{API_URL}/dashboard/")
        if response.ok:
            data = response.json()
            return f"""
**Dashboard Overview:**

- Open Requests: {data.get("open_requests", 0)}
- Active Providers: {data.get("active_providers", 0)}
- Accepted Offers: {data.get("accepted_offers", 0)}
- Completed Requests: {data.get("completed_requests", 0)}
"""
        return "Failed to fetch dashboard"
    except Exception as e:
        return f"Connection error: {str(e)}"


def get_users():
    try:
        response = requests.get(f"{API_URL}/users/")
        if response.ok:
            users = response.json()
            return json.dumps(users, indent=2)
        return "Failed to fetch users"
    except Exception as e:
        return f"Connection error: {str(e)}"


def get_providers():
    try:
        response = requests.get(f"{API_URL}/providers/")
        if response.ok:
            providers = response.json()
            result = "**Available Providers:**\n\n"
            for p in providers[:10]:
                result += f"- {p.get('user_name', 'N/A')} ({p.get('service_type', 'N/A')}) - Active: {p.get('is_active', False)}\n"
            return result
        return "Failed to fetch providers"
    except Exception as e:
        return f"Connection error: {str(e)}"


def register_customer(name, phone, pin, location):
    try:
        response = requests.post(
            f"{API_URL}/auth/register/",
            json={
                "name": name,
                "phone": phone,
                "pin": pin,
                "role": "customer",
                "location": location,
            },
        )
        if response.ok:
            return f"Registration successful for {name}!"
        return f"Registration failed: {response.json().get('error', 'Unknown error')}"
    except Exception as e:
        return f"Connection error: {str(e)}"


def register_provider(name, phone, pin, location, service_type):
    try:
        response = requests.post(
            f"{API_URL}/auth/register/",
            json={
                "name": name,
                "phone": phone,
                "pin": pin,
                "role": "provider",
                "location": location,
                "service_type": service_type,
            },
        )
        if response.ok:
            return f"Provider registration successful for {name}!"
        return f"Registration failed: {response.json().get('error', 'Unknown error')}"
    except Exception as e:
        return f"Connection error: {str(e)}"


with gr.Blocks(
    title="SevaSetu - Rural Services Platform", theme=gr.themes.Soft()
) as demo:
    gr.Markdown("""
    # 🌾 SevaSetu - Rural Services Platform
    
    **Connecting rural communities with local services, medicines, and farm supplies.**
    
    ---
    """)

    with gr.Tabs():
        with gr.TabItem("📊 Dashboard"):
            gr.Markdown("### Platform Statistics")
            dashboard_output = gr.Textbox(label="Dashboard", lines=8, interactive=False)
            gr.Button("🔄 Refresh Dashboard").click(
                fn=get_dashboard, outputs=dashboard_output
            )

        with gr.TabItem("👥 Users"):
            gr.Markdown("### Registered Users")
            users_output = gr.Textbox(label="Users", lines=15, interactive=False)
            gr.Button("🔄 Load Users").click(fn=get_users, outputs=users_output)

        with gr.TabItem("🔧 Providers"):
            gr.Markdown("### Service Providers")
            providers_output = gr.Textbox(
                label="Providers", lines=15, interactive=False
            )
            gr.Button("🔄 Load Providers").click(
                fn=get_providers, outputs=providers_output
            )

        with gr.TabItem("👤 Customer Login"):
            gr.Markdown("### Customer Login")
            with gr.Row():
                c_phone = gr.Textbox(label="Phone", placeholder="9000000001")
                c_pin = gr.Textbox(label="PIN", placeholder="123456", type="password")
            c_login_output = gr.Textbox(label="Result", lines=3)
            gr.Button("🔐 Login").click(
                fn=login_customer, inputs=[c_phone, c_pin], outputs=c_login_output
            )

            gr.Markdown("### Register New Customer")
            with gr.Row():
                c_name = gr.Textbox(label="Name", placeholder="John Doe")
                c_phone_reg = gr.Textbox(label="Phone", placeholder="9000000001")
            with gr.Row():
                c_pin_reg = gr.Textbox(
                    label="PIN", type="password", placeholder="123456"
                )
                c_location = gr.Textbox(label="Location", placeholder="Chilakaluripet")
            c_reg_output = gr.Textbox(label="Result", lines=2)
            gr.Button("📝 Register").click(
                fn=register_customer,
                inputs=[c_name, c_phone_reg, c_pin_reg, c_location],
                outputs=c_reg_output,
            )

        with gr.TabItem("🔧 Provider Login"):
            gr.Markdown("### Provider Login")
            with gr.Row():
                p_phone = gr.Textbox(label="Phone", placeholder="9100000001")
                p_pin = gr.Textbox(label="PIN", type="password", placeholder="123456")
            p_login_output = gr.Textbox(label="Result", lines=3)
            gr.Button("🔐 Login").click(
                fn=login_provider, inputs=[p_phone, p_pin], outputs=p_login_output
            )

            gr.Markdown("### Register New Provider")
            with gr.Row():
                p_name = gr.Textbox(
                    label="Business Name", placeholder="Suresh Electric Works"
                )
                p_phone_reg = gr.Textbox(label="Phone", placeholder="9100000001")
            with gr.Row():
                p_pin_reg = gr.Textbox(
                    label="PIN", type="password", placeholder="123456"
                )
                p_location = gr.Textbox(label="Location", placeholder="Chilakaluripet")
            p_service = gr.Dropdown(
                [
                    "electrician",
                    "plumber",
                    "mechanic",
                    "tractor_rental",
                    "pump_repair",
                    "medicines",
                    "fertilizers",
                    "seeds",
                    "pesticides",
                    "tools",
                ],
                label="Service Type",
            )
            p_reg_output = gr.Textbox(label="Result", lines=2)
            gr.Button("📝 Register").click(
                fn=register_provider,
                inputs=[p_name, p_phone_reg, p_pin_reg, p_location, p_service],
                outputs=p_reg_output,
            )

        with gr.TabItem("ℹ️ About"):
            gr.Markdown("""
            ## About SevaSetu
            
            **SevaSetu** (meaning "Bridge of Service") is a platform designed to connect rural communities with essential services.
            
            ### Features:
            - 🏠 **Local Services** - Electricians, Plumbers, Mechanics
            - 💊 **Medicine Delivery** - Pharmacy services
            - 🌾 **Farm Supplies** - Fertilizers, Seeds, Pesticides, Tools
            
            ### For Demo:
            - **Customer Login**: Phone `9000000001`, PIN `123456`
            - **Provider Login**: Phone `9100000001`, PIN `123456`
            - **Admin Login**: Username `admin`, PIN `123456`
            
            > **Note**: Deploy your backend server and update API_URL to use login functionality.
            """)

if __name__ == "__main__":
    demo.launch()
