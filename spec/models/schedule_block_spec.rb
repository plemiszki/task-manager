require "rails_helper"

RSpec.describe ScheduleBlock, type: :model do
  let(:user) { User.create!(email: "test@example.com", password: "password123") }

  def build_block(attrs = {})
    ScheduleBlock.new({
      user: user,
      weekday: 0,
      start_time: "09:00",
      end_time: "10:00",
      color: "#5bc0de",
      text: "Test Block",
    }.merge(attrs))
  end

  describe "presence validations" do
    it "is valid with all attributes" do
      expect(build_block).to be_valid
    end

    it "requires user" do
      block = build_block(user: nil)
      expect(block).not_to be_valid
      expect(block.errors[:user]).to be_present
    end

    it "requires weekday" do
      block = build_block(weekday: nil)
      expect(block).not_to be_valid
      expect(block.errors[:weekday]).to be_present
    end

    it "requires start_time" do
      block = build_block(start_time: nil)
      expect(block).not_to be_valid
      expect(block.errors[:start_time]).to be_present
    end

    it "requires end_time" do
      block = build_block(end_time: nil)
      expect(block).not_to be_valid
      expect(block.errors[:end_time]).to be_present
    end

    it "requires color" do
      block = build_block(color: nil)
      expect(block).not_to be_valid
      expect(block.errors[:color]).to be_present
    end

    it "requires text" do
      block = build_block(text: nil)
      expect(block).not_to be_valid
      expect(block.errors[:text]).to be_present
    end
  end

  describe "overlap validation" do
    before do
      # Monday 9:00-10:00, all-days block
      build_block.save!
    end

    it "rejects a block that fully overlaps an existing block" do
      block = build_block(start_time: "08:00", end_time: "11:00")
      expect(block).not_to be_valid
      expect(block.errors[:base]).to include("overlaps with an existing schedule block")
    end

    it "rejects a block that partially overlaps the start of an existing block" do
      block = build_block(start_time: "08:30", end_time: "09:30")
      expect(block).not_to be_valid
    end

    it "rejects a block that partially overlaps the end of an existing block" do
      block = build_block(start_time: "09:30", end_time: "10:30")
      expect(block).not_to be_valid
    end

    it "rejects a block contained within an existing block" do
      block = build_block(start_time: "09:15", end_time: "09:45")
      expect(block).not_to be_valid
    end

    it "allows a block adjacent to an existing block (no gap)" do
      block = build_block(start_time: "10:00", end_time: "11:00")
      expect(block).to be_valid
    end

    it "allows a block on a different weekday at the same time" do
      block = build_block(weekday: 3)
      expect(block).to be_valid
    end

    it "allows a block for a different user at the same time and weekday" do
      other_user = User.create!(email: "other@example.com", password: "password123")
      block = build_block(user: other_user)
      expect(block).to be_valid
    end

    it "does not conflict with itself when updating" do
      existing = ScheduleBlock.first
      existing.text = "Updated Text"
      expect(existing).to be_valid
    end

    context "variant-aware overlap" do
      let(:variant_a) { ScheduleDayVariant.create!(user: user, weekday: 0, name: "Early") }
      let(:variant_b) { ScheduleDayVariant.create!(user: user, weekday: 0, name: "Late") }

      # These rely on the outer before-block's all-days block being present
      it "rejects a normal-day-only block overlapping an all-days block" do
        block = build_block(normal_day_only: true)
        expect(block).not_to be_valid
      end

      it "rejects a variant block overlapping an all-days block" do
        block = build_block(schedule_day_variant: variant_a)
        expect(block).not_to be_valid
      end

      # These need a clean slate (no all-days block)
      context "without an all-days block" do
        before { ScheduleBlock.delete_all }

        it "rejects two blocks with the same variant that overlap" do
          build_block(schedule_day_variant: variant_a).save!
          block = build_block(schedule_day_variant: variant_a)
          expect(block).not_to be_valid
        end

        it "allows two blocks with different variants to overlap" do
          build_block(schedule_day_variant: variant_a).save!
          block = build_block(schedule_day_variant: variant_b)
          expect(block).to be_valid
        end

        it "allows a variant block to overlap a normal-day-only block" do
          build_block(normal_day_only: true).save!
          block = build_block(schedule_day_variant: variant_a)
          expect(block).to be_valid
        end

        it "rejects two normal-day-only blocks that overlap" do
          build_block(normal_day_only: true).save!
          block = build_block(normal_day_only: true)
          expect(block).not_to be_valid
        end
      end
    end
  end
end
