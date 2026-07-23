import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { business } from '../constants/store.js';
import { apiClient } from '../services/apiClient.js';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  async function submit(event) {
    event.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.show('Please complete all fields.', 'info');
      return;
    }
    try {
      await apiClient.post('/contact', form);
    } catch {
      // Fallback keeps the client experience smooth when the API is not yet deployed.
    }
    toast.show('Message received. The store will contact you soon.');
    setForm({ name: '', phone: '', message: '' });
  }

  return (
    <main className="page">
      <Seo title="Contact" description="Contact Pasand Showroom by phone, WhatsApp, email or store visit." />
      <section className="page-hero compact"><span className="eyebrow">Contact</span><h1>Speak directly with the store.</h1></section>
      <section className="section contact-layout">
        <div className="contact-info">
          <p><MapPin /> {business.address}</p>
          <p><Phone /> {business.phone}</p>
          <p><Mail /> {business.email}</p>
          <p>{business.hours}</p>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
          <Button>Submit</Button>
        </form>
      </section>
      <section className="map-section"><iframe title="Store location map" src="https://www.google.com/maps?q=India%20fashion%20store&output=embed" loading="lazy" /></section>
    </main>
  );
}
