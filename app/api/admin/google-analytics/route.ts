import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 });
    }

    // Dekóduj base64 credentials z env
    const credentialsBase64 = process.env.GOOGLE_ANALYTICS_CREDENTIALS_BASE64;
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    if (!credentialsBase64 || !propertyId) {
      return NextResponse.json(
        { error: 'Google Analytics credentials not configured' },
        { status: 400 }
      );
    }

    // Dekóduj JSON z base64
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    // Inicializuj Google Analytics client
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      } as any,
    });

    // Poslední 7 dní
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const response = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
        {
          name: 'screenPageViews',
        },
      ],
    });

    // Transformuj data do čitelného formátu
    const chartData = (
      response[0].rows?.map((row: any) => {
        const date = row.dimensionValues?.[0]?.value || '';
        const visitors = parseInt(row.metricValues?.[0]?.value || '0', 10);
        const pageviews = parseInt(row.metricValues?.[1]?.value || '0', 10);

        // Formátu datum
        const dateObj = new Date(
          parseInt(date.substring(0, 4)),
          parseInt(date.substring(4, 6)) - 1,
          parseInt(date.substring(6, 8))
        );

        const MONTHS = [
          'Led', 'Úno', 'Břez', 'Dub', 'Kvě', 'Červ',
          'Červ', 'Srp', 'Září', 'Říj', 'Lís', 'Pro'
        ];

        return {
          name: `${dateObj.getDate()}. ${MONTHS[dateObj.getMonth()]}`,
          date: date,
          visitors,
          pageviews,
        };
      }) || []
    ).sort((a: any, b: any) => a.date.localeCompare(b.date));

    return NextResponse.json({
      data: chartData,
      configured: true,
    });
  } catch (error) {
    console.error('Google Analytics Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
