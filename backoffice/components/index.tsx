import { ComponentLoader } from 'adminjs';

export const componentLoader = new ComponentLoader();

export const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard'),
  FileIngestion: componentLoader.add(
    'FileIngestion',
    './pages/file-ingestion/page',
  ),
  EmailUsers: componentLoader.add('EmailUsers', './pages/email-users/page'),
  Many2ManySources: componentLoader.add(
    'Many2ManySources',
    './molecules/many-2-many-sources',
  ),
  CountrySelector: componentLoader.add(
    'CountrySelector',
    './atoms/country-selector.tsx',
  ),
  DownloadUserFiles: componentLoader.add(
    'DownloadUserFiles',
    './molecules/download-user-files',
  ),
  DownloadDataIngestionFile: componentLoader.add(
    'DownloadDataIngestionFile',
    './molecules/download-data-ingestion-file',
  ),
  ProjectDynamicForm: componentLoader.add(
    'ProjectDynamicForm',
    './organisms/project-dynamic-form',
  ),
  CustomRichTextEditor: componentLoader.add(
    'CustomRichTextEditor',
    './atoms/custom-rich-text-editor',
  ),
  HtmlDisplay: componentLoader.add('HtmlDisplay', './atoms/html-display'),
};
