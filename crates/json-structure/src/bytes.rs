use serde::Serialize;

pub(crate) struct Counter {
    count: usize,
    maximum: usize,
}
impl std::io::Write for Counter {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        self.count = self
            .count
            .checked_add(bytes.len())
            .ok_or_else(|| std::io::Error::other("source bound"))?;
        if self.count > self.maximum {
            return Err(std::io::Error::other("source bound"));
        }
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
/// # Errors
/// Rejects serialized input exceeding the explicit maximum, capped at 64 KiB.
pub fn check_bytes(value: &impl Serialize, maximum: usize) -> Result<(), &'static str> {
    if maximum == 0 || maximum > 65536 {
        return Err("source-byte-limit");
    }
    serde_json::to_writer(&mut Counter { count: 0, maximum }, value)
        .map_err(|_| "source-byte-limit")
}
