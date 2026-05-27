import { encodeBplist } from './bplist';

export function generateShortcutBlob(token: string, itemName: string, origin: string): Blob {
  const triggerUrl = `${origin}/api/lost/shortcut/${token}`;
  const bytes = encodeBplist({
    WFWorkflowClientRelease: '2.0',
    WFWorkflowClientVersion: 2190,
    WFWorkflowMinimumClientVersion: 900,
    WFWorkflowName: `Я потеряла ${itemName}`,
    WFWorkflowIcon: {
      WFWorkflowIconGlyphNumber: 59499,
      WFWorkflowIconStartColor: 4274264319,
    },
    WFWorkflowImportQuestions: [],
    WFWorkflowInputContentItemClasses: [],
    WFWorkflowTypes: ['WatchKit'],
    WFWorkflowHasShortcutInputVariables: false,
    WFWorkflowActions: [
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
        WFWorkflowActionParameters: {
          WFHTTPMethod: 'GET',
          WFURL: triggerUrl,
        },
      },
    ],
  });
  return new Blob([bytes], { type: 'application/octet-stream' });
}
