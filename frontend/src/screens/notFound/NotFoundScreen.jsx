import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 80px;
  color: #4318ff;
  margin: 0;
`;

const Subtitle = styled.h2`
  color: #2b3674;
  margin-bottom: 10px;
`;

const StyledLink = styled(Link)`
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #4318ff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
`;

const NotFoundScreen = () => {
  return (
    <Container>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <p style={{ color: "#a3aed0" }}>The route you are looking for doesn't exist.</p>
      <StyledLink to="/">Return to Dashboard</StyledLink>
    </Container>
  );
};

export default NotFoundScreen;