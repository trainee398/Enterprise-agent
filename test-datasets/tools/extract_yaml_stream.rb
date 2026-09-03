#!/usr/bin/env ruby
# Extract fenced YAML blocks from the human-readable dataset specifications.
# The generated stream keeps the schema, cases, and metadata as YAML documents.
require "yaml"

files = ARGV
abort("usage: extract_yaml_stream.rb FILE...") if files.empty?

files.each do |source|
  blocks = File.read(source).scan(/```yaml\s*\n(.*?)```/m).flatten
  abort("no fenced YAML blocks: #{source}") if blocks.empty?
  # The first block in some specs is only a schema example with a fake case_id.
  # Keep the actual case collection and metadata, while dropping that example.
  case_blocks = blocks.select { |block| block.scan(/^case_id:/).length > 1 }
  if !case_blocks.empty?
    blocks = case_blocks + blocks.reject do |block|
      case_blocks.include?(block) || block.scan(/^case_id:/).length == 1
    end
  end
  target = source.sub(/\.yaml\z/, ".stream.yaml")
  stream = blocks.map { |block| block.strip }.join("\n---\n") + "\n"
  YAML.load_stream(stream)
  File.write(target, stream)
  puts "generated #{target} (#{blocks.length} YAML documents)"
end
