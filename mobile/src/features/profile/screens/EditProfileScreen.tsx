import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { getProfile, updateProfile } from "../../../api/profile";

export default function EditProfileScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const data = await getProfile();
        if (!cancelled) {
          setDisplayName(data.display_name);
          setUsername(data.username);
          setRegion(data.region ?? "");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim(),
        region: region.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Could not update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Edit Profile</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display name"
        autoCapitalize="words"
        editable={!saving}
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
        editable={!saving}
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="Region (optional)"
        editable={!saving}
      />

      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});
