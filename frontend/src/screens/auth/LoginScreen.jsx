import { useState } from "react";
import styled from "styled-components";

// --- Styled Components ---
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #0b1437; /* <-- The cool dark blue background! */
`;

const LoginCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: #2b3674;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #e0e5f2;
  font-size: 16px;
  color: #2b3674;
  outline: none;
  &:focus {
    border-color: #4318ff;
  }
`;

const Button = styled.button`
  padding: 14px;
  background-color: #4318ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: #3311cc;
  }
`;

const ErrorMessage = styled.p`
  color: #e31a1a;
  background-color: #ffe5e5;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
`;

// --- Component logic ---
const LoginScreen = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuth(true);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Admin Login</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleLogin}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit">Sign In</Button>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginScreen;