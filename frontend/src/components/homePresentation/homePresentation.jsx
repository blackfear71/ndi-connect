import { Container, Image, Stack } from 'react-bootstrap';

import ndiConnectLogo from '../../assets/images/ndi-connect.png';

import './homePresentation.css';

const RightItem = ({ src, title }) => (
    <div className="home-presentation-item-card d-flex align-items-center">
        <Image src={src} width={60} height={60} />
        <div className="home-presentation-item-text ms-3">{title}</div>
    </div>
);

const HomePresentation = () => {
    return (
        <Container>
            <Stack
                direction="horizontal"
                gap={3}
                className="home-presentation-container"
            >
                {/* Bloc gauche */}
                <div className="home-presentation-left-block">
                    <div className="home-presentation-image-wrapper">
                        <Image
                            src={ndiConnectLogo}
                            className="home-presentation-image"
                        />
                    </div>
                    <div>Recette aléatoire</div>
                </div>

                {/* Bloc droit */}
                <Stack
                    gap={3}
                    className="home-presentation-right-block justify-content-between"
                >
                    <RightItem src={ndiConnectLogo} title="Toutes les recettes" />
                    <RightItem src={ndiConnectLogo} title="Me connecter" />
                    <RightItem src={ndiConnectLogo} title="Mes favoris (connecté)" />
                </Stack>
            </Stack>
        </Container>
    );
};

export default HomePresentation;
