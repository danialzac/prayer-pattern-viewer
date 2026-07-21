package com.prayertracker.patternviewer.repository;

import com.prayertracker.patternviewer.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

//! A repository is Spring's ready-made database helper for one entity type.
//! Repository ni helper database siap Spring untuk satu jenis entity.
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    //? Optional means this may return a user or may return nothing if the email is not found.
    //? Optional maksudnya dia mungkin pulang user, atau mungkin tak jumpa apa-apa kalau email tak ada.
    Optional<AppUser> findByEmail(String email);

    //? This is a quick yes/no check used before creating a new account.
    //? Ni check cepat jenis ya/tidak sebelum buat akaun baru.
    boolean existsByEmail(String email);
}
