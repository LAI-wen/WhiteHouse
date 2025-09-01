import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 批量保存步驟、選項和結果
export async function POST(request, { params }) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { steps, options, outcomes } = body;

    const results = {
      stepsCreated: 0,
      optionsCreated: 0,
      outcomesCreated: 0,
      errors: []
    };

    // 1. 批量創建步驟
    if (steps && steps.length > 0) {
      try {
        const stepRows = steps.map(step => [
          step.stepId,
          campaignId,
          step.title,
          step.description,
          step.imageUrl || '',
          step.isStartingStep ? 'TRUE' : 'FALSE',
          new Date().toISOString().split('T')[0]
        ]);

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'EventSteps!A:G',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: stepRows
          }
        });

        results.stepsCreated = stepRows.length;
      } catch (error) {
        console.error('Batch create steps error:', error);
        results.errors.push(`步驟創建失敗: ${error.message}`);
      }
    }

    // 2. 批量創建選項
    if (options && options.length > 0) {
      try {
        const optionRows = options.map(option => [
          option.optionId,
          option.sourceStepId,
          option.targetStepId || '',
          option.optionText,
          option.reqStatName || '',
          option.reqStatOperator || '',
          option.reqStatValue || '',
          option.reqItemId || '',
          option.requirementText || '',
          'TRUE' // Is_Available 預設啟用
        ]);

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'EventOptions!A:J',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: optionRows
          }
        });

        results.optionsCreated = optionRows.length;
      } catch (error) {
        console.error('Batch create options error:', error);
        results.errors.push(`選項創建失敗: ${error.message}`);
      }
    }

    // 3. 批量創建結果
    if (outcomes && outcomes.length > 0) {
      try {
        const outcomeRows = outcomes.map(outcome => [
          outcome.outcomeId,
          outcome.triggerOptionId,
          outcome.outcomeType,
          outcome.outcomeTarget || '',
          outcome.outcomeValue || '',
          outcome.outcomeDescription || '',
          outcome.discordMessage || ''
        ]);

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'EventOutcomes!A:G',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: outcomeRows
          }
        });

        results.outcomesCreated = outcomeRows.length;
      } catch (error) {
        console.error('Batch create outcomes error:', error);
        results.errors.push(`結果創建失敗: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      data: results,
      message: `批量保存完成: ${results.stepsCreated} 步驟, ${results.optionsCreated} 選項, ${results.outcomesCreated} 結果`
    });

  } catch (error) {
    console.error('Batch Save API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Batch save failed',
      details: error.message
    }, { status: 500 });
  }
}