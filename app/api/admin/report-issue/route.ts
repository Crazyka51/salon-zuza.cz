import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

const prisma = new PrismaClient()

interface IssueFormData {
  get(name: string): File | string | null
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const isReports = await prisma.issueReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({
      success: true,
      count: isReports.length,
      reports: isReports,
    })
  } catch (error) {
    console.error('Chyba při načítání hlášení:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání hlášení' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const formData = await request.formData() as unknown as IssueFormData
    const descriptionValue = formData.get('description')
    const severityValue = formData.get('severity')
    const file = formData.get('file')
    const description = typeof descriptionValue === 'string' ? descriptionValue : ''
    const severity = typeof severityValue === 'string' ? severityValue : ''

    if (!description) {
      return NextResponse.json(
        { error: 'Popis problému je povinný' },
        { status: 400 }
      )
    }

    let attachmentUrl = null

    // Nahrání attachment pokud existuje
    if (file && typeof file !== 'string') {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)
        const extension = file.name.split('.').pop() || 'png'

        const blob = await put(
          `issue-reports/${timestamp}-${randomStr}.${extension}`,
          buffer,
          {
            access: 'public',
            contentType: file.type,
          }
        )
        attachmentUrl = blob.url
      } catch (uploadError) {
        console.error('Chyba při uploadu přílohy:', uploadError)
        // Pokračujeme bez přílohy
      }
    }

    // Uložení hlášení do databáze
    const issueReport = await prisma.issueReport.create({
      data: {
        description: description,
        severity: severity,
        attachmentUrl: attachmentUrl || null,
      },
    })

    // Odeslání emailu přes Formspree
    try {
      const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT
      if (formspreeEndpoint) {
        const formspreeData = new FormData()
        formspreeData.append('severity', severity)
        formspreeData.append('message', description)
        formspreeData.append('timestamp', new Date().toLocaleString('cs-CZ'))
        if (attachmentUrl) {
          formspreeData.append('attachment_url', attachmentUrl)
        }

        const emailResponse = await fetch(formspreeEndpoint, {
          method: 'POST',
          body: formspreeData,
        })

        if (!emailResponse.ok) {
          console.error('⚠️  Email přes Formspree se nepodařilo odeslat, ale hlášení je uloženo v databázi')
        } else {
          console.log('✉️  Email úspěšně odeslán na matejhrabak@gmail.com')
        }
      }
    } catch (emailError) {
      console.error('⚠️  Chyba při odesílání emailu:', emailError)
      // Pokračujeme - hlášení je už uloženo v databázi
    }

    // Log hlášení (pro debug)
    console.log('📋 Nové hlášení problému:')
    console.log(`  Závažnost: ${severity}`)
    console.log(`  Čas: ${new Date().toLocaleString('cs-CZ')}`)
    console.log(`  Popis: ${description}`)
    if (attachmentUrl) console.log(`  Příloha: ${attachmentUrl}`)
    console.log(`  ID: ${issueReport.id}`)

    return NextResponse.json({
      success: true,
      message: 'Hlášení bylo úspěšně uloženo a odeslano',
      id: issueReport.id,
    })
  } catch (error) {
    console.error('Chyba při zpracování hlášení:', error)
    return NextResponse.json(
      { error: 'Chyba při odesílání hlášení' },
      { status: 500 }
    )
  }
}
