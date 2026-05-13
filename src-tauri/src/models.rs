use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModConfig {
    pub id: String,
    pub name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub type_field: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<String>,
    #[serde(rename = "iflowVersion", skip_serializing_if = "Option::is_none")]
    pub iflow_version: Option<String>,
    #[serde(rename = "iflowVersionConstraint", skip_serializing_if = "Option::is_none")]
    pub iflow_version_constraint: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repository: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub license: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entry: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub full_path: String,
    pub relative_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildConfig {
    pub mod_path: String,
    pub output_path: String,
    pub file_name: String,
    pub compress_level: String,
    pub skip_validation: bool,
    pub open_after_build: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct BuildProgress {
    pub percent: u32,
    pub file: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub default_output_path: String,
    pub default_compress_level: String,
    pub open_output_after_build: bool,
    pub validate_after_build: bool,
    pub theme: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            default_output_path: "~/dist".to_string(),
            default_compress_level: "standard".to_string(),
            open_output_after_build: true,
            validate_after_build: true,
            theme: "system".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildResult {
    pub success: bool,
    pub output_path: String,
    pub file_count: u32,
    pub file_size: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}