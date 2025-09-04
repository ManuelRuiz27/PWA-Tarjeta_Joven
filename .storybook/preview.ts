import type { Preview } from '@storybook/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    a11y: { disable: false },
    docs: {
      description: {
        component: 'Historias de componentes con controles. Textos y comentarios en español.',
      },
    },
  },
};

export default preview;

