/**
 * ObligationTable — Shows the contract obligations register.
 * Desktop: full table. Mobile: card list.
 */

const STATUS_CLASSES = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  done: 'bg-green-100 text-green-700 border-green-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
}

const PARTY_CLASSES = {
  Contractor: 'bg-blue-100 text-blue-700',
  Client: 'bg-purple-100 text-purple-700',
  Both: 'bg-gray-100 text-gray-600',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_CLASSES[status] ?? STATUS_CLASSES.pending}`}>
      {status}
    </span>
  )
}

function PartyBadge({ party }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${PARTY_CLASSES[party] ?? PARTY_CLASSES.Both}`}>
      {party}
    </span>
  )
}

export default function ObligationTable({ obligations }) {
  if (!obligations || obligations.length === 0) {
    return (
      <div className="card text-center py-10 text-gray-400">
        <p className="text-sm">No obligations extracted — upload a contract to populate this table.</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-heading font-bold text-gray-500 uppercase tracking-wide text-xs">Obligation</th>
              <th className="text-left px-4 py-3 font-heading font-bold text-gray-500 uppercase tracking-wide text-xs w-28">Party</th>
              <th className="text-left px-4 py-3 font-heading font-bold text-gray-500 uppercase tracking-wide text-xs w-28">Clause</th>
              <th className="text-left px-4 py-3 font-heading font-bold text-gray-500 uppercase tracking-wide text-xs w-40">Due</th>
              <th className="text-left px-4 py-3 font-heading font-bold text-gray-500 uppercase tracking-wide text-xs w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {obligations.map((ob, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-gray-800 leading-snug">{ob.obligation}</td>
                <td className="px-4 py-3.5">
                  <PartyBadge party={ob.party} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono-clause text-gray-500">{ob.clause}</span>
                </td>
                <td className="px-4 py-3.5 text-gray-600 text-xs leading-snug">{ob.due}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={ob.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {obligations.map((ob, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <StatusBadge status={ob.status} />
              <PartyBadge party={ob.party} />
            </div>
            <p className="text-sm text-gray-800 font-medium leading-snug mb-2">{ob.obligation}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="font-mono-clause">{ob.clause}</span>
              <span>Due: {ob.due}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
