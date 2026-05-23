type ServiceItem = {
  id?: number
  title?: string
  name?: string
  description?: string
  short_description?: string
  price?: number | string
}

export default function ServiceCards({ items = [] }: { items?: ServiceItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Assignment Guidance',
            description:
              'Get ethical academic guidance, structure support, and improvement suggestions.',
          },
          {
            title: 'Research Support',
            description:
              'Topic selection, literature review guidance, citation support, and formatting help.',
          },
          {
            title: 'Presentation Design',
            description:
              'Clean, student-friendly slides for class, viva, seminar, and project presentation.',
          },
        ].map((service, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-900">
              {service.title}
            </h3>
            <p className="mt-3 text-slate-600">{service.description}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((service, index) => (
        <div
          key={service.id || index}
          className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-slate-900">
            {service.name || service.title || 'Academic Support'}
          </h3>

          <p className="mt-3 text-slate-600">
            {service.short_description ||
              service.description ||
              'Student-friendly academic support service.'}
          </p>

          {service.price && (
            <p className="mt-4 font-semibold text-blue-700">
              Starting from ৳{service.price}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}