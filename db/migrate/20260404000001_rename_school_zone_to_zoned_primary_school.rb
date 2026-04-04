class RenameSchoolZoneToZonedPrimarySchool < ActiveRecord::Migration[8.0]
  def change
    rename_column :properties, :school_zone, :zoned_primary_school
  end
end
