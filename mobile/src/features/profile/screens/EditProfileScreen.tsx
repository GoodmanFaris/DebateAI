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
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../../../api/profile";
import colors from "../../../constants/colors";
import COUNTRIES from "../../../constants/countries";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.back();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Could not update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(74, 144, 217, 0.2)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topLeftGlow}
      />
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.2)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topRightGlow}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable style={styles.backLink} onPress={() => router.back()} disabled={saving}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryBlue} />
          <Text style={styles.backLinkText}>Profile</Text>
        </Pressable>

        <Text style={styles.heading}>Edit Profile</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Display Name */}
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your display name"
          placeholderTextColor="rgba(255,255,255,0.25)"
          autoCapitalize="words"
          editable={!saving}
        />

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="@username"
          placeholderTextColor="rgba(255,255,255,0.25)"
          autoCapitalize="none"
          editable={!saving}
        />

        {/* Region */}
        <Text style={styles.label}>Region</Text>
        <Pressable
          style={[styles.input, styles.pickerTrigger]}
          onPress={() => {
            setSearch("");
            setPickerVisible(true);
          }}
          disabled={saving}
        >
          <Text
            style={region ? styles.pickerValue : styles.pickerPlaceholder}
          >
            {region || "Select your country"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="rgba(255,255,255,0.35)"
          />
        </Pressable>

        {/* Bottom spacer so content clears the fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed save button */}
      <View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Pressable
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textPrimary} />
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
      </View>

      {/* Country picker modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modal}>
          {/* Modal handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <Pressable onPress={() => setPickerVisible(false)}>
              <Ionicons
                name="close"
                size={22}
                color="rgba(255,255,255,0.6)"
              />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={15}
              color="rgba(255,255,255,0.3)"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search country..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.countryRow,
                  item === region && styles.countryRowSelected,
                ]}
                onPress={() => {
                  setRegion(item);
                  setPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.countryText,
                    item === region && styles.countryTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {item === region && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.primaryBlue}
                  />
                )}
              </Pressable>
            )}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topLeftGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: 280,
  },
  topRightGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "70%",
    height: 280,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 56,
  },

  // Back
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  backLinkText: {
    color: colors.primaryBlue,
    fontSize: 15,
    fontWeight: "600",
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 28,
  },
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    marginBottom: 16,
  },

  // Fields
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  pickerTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: "rgba(255,255,255,0.25)",
  },

  // CTA bar
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "rgba(25, 30, 39, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  saveButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 15,
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: "#1C2130",
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  countryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  countryRowSelected: {
    backgroundColor: "rgba(74,144,217,0.1)",
  },
  countryText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
  },
  countryTextSelected: {
    color: colors.primaryBlue,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
  },
});
