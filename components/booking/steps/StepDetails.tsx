'use client'

import { DatabaseText } from '@/components/DatabaseText'
import type { KontaktniUdaje } from '@/components/booking/types'

interface StepDetailsProps {
  formData: KontaktniUdaje
  onChange: (data: Partial<KontaktniUdaje>) => void
  acknowledgedWaitForApproval: boolean
  onAcknowledgeChange: (value: boolean) => void
}

// Krok 4: Kontaktní údaje zákazníka
export default function StepDetails({ formData, onChange, acknowledgedWaitForApproval, onAcknowledgeChange }: StepDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="jmeno" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_jmeno" typ="text" as="span" placeholder="Jméno" /> *
          </label>
          <input
            id="jmeno"
            type="text"
            required
            value={formData.jmeno}
            onChange={(e) => onChange({ jmeno: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
            placeholder="Vaše jméno"
          />
        </div>
        <div>
          <label htmlFor="prijmeni" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_prijmeni" typ="text" as="span" placeholder="Příjmení" /> *
          </label>
          <input
            id="prijmeni"
            type="text"
            required
            value={formData.prijmeni}
            onChange={(e) => onChange({ prijmeni: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
            placeholder="Vaše příjmení"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_email" typ="text" as="span" placeholder="Email" /> <span className="font-normal text-gray-500">(nepovinný)</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
            placeholder="vas@email.cz"
          />
          {!formData.email.trim() && (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Nemáte e-mail? Po odeslání rezervace nás pro ověření kontaktujte telefonicky:{' '}
              <a href="tel:+420724311258" className="font-semibold underline underline-offset-2 hover:text-amber-700">
                +420 724 311 258
              </a>
            </p>
          )}
        </div>
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_telefon" typ="text" as="span" placeholder="Telefon" /> *
          </label>
          <input
            id="telefon"
            type="tel"
            required
            value={formData.telefon}
            onChange={(e) => onChange({ telefon: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
            placeholder="+420 123 456 789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pocetOsob" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_pocet_osob" typ="text" as="span" placeholder="Počet osob (včetně vás)" />
          </label>
          <input
            id="pocetOsob"
            type="number"
            min={1}
            value={formData.pocetOsob}
            onChange={(e) => onChange({ pocetOsob: Number(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
          />
        </div>
        <div>
          <label htmlFor="pocetDeti" className="block text-sm font-medium text-[#333333] mb-2">
            <DatabaseText klic="rezervace_label_pocet_deti" typ="text" as="span" placeholder="Počet dětí" />
          </label>
          <input
            id="pocetDeti"
            type="number"
            min={0}
            value={formData.pocetDeti}
            onChange={(e) => onChange({ pocetDeti: Number(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="poznamka" className="block text-sm font-medium text-[#333333] mb-2">
          Poznámka
        </label>
        <textarea
          id="poznamka"
          rows={3}
          value={formData.poznamka}
          onChange={(e) => onChange({ poznamka: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876]"
          placeholder="Nepovinná poznámka pro salon…"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={acknowledgedWaitForApproval}
          onChange={(e) => onAcknowledgeChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#A39566]"
        />
        <span>
          Beru na vědomí, že rezervace není automaticky potvrzena a musí být schválena salonem e-mailem.
        </span>
      </label>
    </div>
  )
}
