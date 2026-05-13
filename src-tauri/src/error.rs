use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("文件不存在: {0}")]
    FileNotFound(String),

    #[error("验证失败: {0}")]
    ValidationError(String),

    #[error("打包失败: {0}")]
    BuildError(String),

    #[error("IO 错误: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON 解析错误: {0}")]
    JsonError(#[from] serde_json::Error),
}
