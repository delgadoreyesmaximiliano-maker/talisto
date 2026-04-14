export function exportToCSV(data: Record<string, any>[], filename: string) {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows: string[] = []

    // Header row
    csvRows.push(headers.join(','))

    // Data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header]
            // Escape commas and quotes
            const escaped = String(value ?? '').replace(/"/g, '""')
            return `"${escaped}"`
        })
        csvRows.push(values.join(','))
    }

    const csvString = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
