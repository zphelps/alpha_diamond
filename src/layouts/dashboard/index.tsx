import type { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { withAuthGuard } from '../../hocs/with-auth-guard';
import { useSections } from './config';
import { VerticalLayout } from './vertical-layout';
import {useSettings} from "../../hooks/use-settings";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: FC<LayoutProps> = withAuthGuard((props) => {
  const sections = useSections();
  const settings = useSettings();

  return (
    <VerticalLayout
      sections={sections}
      navColor={settings.navColor}
      {...props}
    />
  );
});

Layout.propTypes = {
  children: PropTypes.node
};
