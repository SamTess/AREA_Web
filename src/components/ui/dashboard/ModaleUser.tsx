import { Modal, TextInput, PasswordInput, Switch, Button } from "@mantine/core";
import { useState, useEffect } from "react";
import { getUserById } from "../../../services/userService"

export function ModaleUser({ opened, onClose, userId }: { opened: boolean; onClose: () => void; userId: string | null; }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    isAdmin: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // put the route call here to save the user profil modification or add user
    onClose();
  };

  useEffect(() => {
    if (userId) {
      getUserById(userId).then(user => {
        setFormData({
          nom: user.profileData?.lastName || '',
          prenom: user.profileData?.firstName || '',
          email: user.email,
          password: user.password || '',
          isAdmin: user.isAdmin,
        });
      }).catch(error => {
        console.error('Error fetching user:', error);
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        isAdmin: false,
      });
    }
  }, [userId]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={userId ? "Edit User Profile" : "Add User"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <TextInput
            label="Email Address"
            placeholder="Enter email address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          { !userId && (
          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!userId}
          />
          )}
          <Switch
            label="Administrator"
            checked={formData.isAdmin}
            onChange={(e) => setFormData({ ...formData, isAdmin: e.currentTarget.checked })}
          />
          <Button type="submit" fullWidth>
            {userId ? "Update" : "Add"}
          </Button>
        </form>
      </Modal>
    </>
  );
}