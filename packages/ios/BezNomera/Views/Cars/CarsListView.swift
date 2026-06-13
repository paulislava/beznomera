import SwiftUI

struct CarsListView: View {
    @EnvironmentObject private var carsStore: CarsStore
    @State private var showCreateCar = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.bzBackground.ignoresSafeArea()

                if carsStore.isLoading && carsStore.cars.isEmpty {
                    ProgressView()
                } else if carsStore.cars.isEmpty {
                    emptyCarsView
                } else {
                    carsList
                }
            }
            .navigationTitle("Мои авто")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showCreateCar = true
                    } label: {
                        Image(systemName: "plus")
                            .fontWeight(.semibold)
                    }
                }
            }
            .refreshable { await carsStore.loadCars() }
            .sheet(isPresented: $showCreateCar) {
                CarFormView(mode: .create)
            }
            .task { if carsStore.cars.isEmpty { await carsStore.loadCars() } }
        }
    }

    private var carsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(carsStore.cars) { car in
                    NavigationLink(destination: CarDetailView(car: car)) {
                        CarRow(car: car)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
    }

    private var emptyCarsView: some View {
        ContentUnavailableView {
            Label("Нет автомобилей", systemImage: "car.fill")
        } description: {
            Text("Добавьте свой первый автомобиль, чтобы другие водители могли связаться с вами")
        } actions: {
            Button("Добавить авто") { showCreateCar = true }
                .buttonStyle(.borderedProminent)
                .tint(.bzPrimary)
        }
    }
}

struct CarRow: View {
    let car: CarInfo

    var body: some View {
        HStack(spacing: 12) {
            // Car image or placeholder
            if let imageUrl = car.imageUrl, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    carPlaceholder
                }
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            } else {
                carPlaceholder
                    .frame(width: 56, height: 56)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 4) {
                PlateView(no: car.no)
                Text(car.displayName.isEmpty ? "Автомобиль" : car.displayName)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
                HStack(spacing: 6) {
                    if let year = car.year {
                        Text("\(year)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if !car.drivers.isEmpty {
                        Text("· \(car.drivers.count) \(driverWord(car.drivers.count))")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let rating = car.rating {
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundStyle(.yellow)
                            Text(String(format: "%.1f", rating))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .glassCard()
    }

    private var carPlaceholder: some View {
        RoundedRectangle(cornerRadius: 10, style: .continuous)
            .fill(Color.bzPrimary.opacity(0.15))
            .overlay(
                Image(systemName: "car.fill")
                    .foregroundStyle(.bzPrimary)
                    .font(.title2)
            )
    }

    private func driverWord(_ count: Int) -> String {
        switch count % 10 {
        case 1 where count % 100 != 11: return "водитель"
        case 2, 3, 4 where !(11...14).contains(count % 100): return "водителя"
        default: return "водителей"
        }
    }
}
