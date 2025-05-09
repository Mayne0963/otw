import React, { useState } from "react"

const EMERGENCY_TYPES = [
  "Medical",
  "Roadside",
  "Personal Safety",
  "Other"
]

export default function EmergencyButton({ onClick }: { onClick?: (type?: string) => void }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedType, setSelectedType] = useState(EMERGENCY_TYPES[0])

  function handleConfirm() {
    setShowModal(false)
    if (onClick) onClick(selectedType)
  }

  return (
    <>
      <button
        className="relative bg-otw-red text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-otw-gold hover:text-black transition focus:outline-none"
        onClick={() => setShowModal(true)}
      >
        <span className="absolute -inset-1 rounded-lg animate-pulse bg-otw-red opacity-30 z-0"></span>
        <span className="relative z-10">Emergency</span>
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-xl text-center">
            <h2 className="text-lg font-bold text-otw-red mb-2">Confirm Emergency</h2>
            <p className="mb-4 text-gray-700">Are you sure you want to trigger an emergency alert?</p>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Type:</label>
            <select
              className="w-full mb-4 p-2 border rounded"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              {EMERGENCY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-otw-red text-white px-4 py-2 rounded hover:bg-otw-gold hover:text-black font-bold"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}